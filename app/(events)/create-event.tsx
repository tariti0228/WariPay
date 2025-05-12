import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, Card, Chip, Portal, TextInput, useTheme, Modal } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/src/db/schema';
import { events, participants } from '@/src/db/schema';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import db from '@/src/db/index';


LocaleConfig.locales.jp = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

export default function CreateEventScreen() {
  const theme = useTheme();
  const [eventName, setEventName] = useState('');
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setParticipantNames([...participantNames, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipantNames(participantNames.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim() || participantNames.length === 0) return;

    try {
      const result = await db.transaction(async (tx) => {
        // イベントを作成
        const [newEvent] = await tx
          .insert(events)
          .values({
            name: eventName,
            date: date.getTime(),
            tags: tags.join(','),
          })
          .returning();

        // 参加者を作成
        const participantValues = participantNames.map(name => ({
          name,
          eventId: newEvent.id,
        }));

        await tx.insert(participants).values(participantValues);

        return newEvent;
      });

      router.back();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onSurface} />
        <Appbar.Content title="イベント作成" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label="イベント名"
            value={eventName}
            onChangeText={setEventName}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="outlined"
            onPress={() => setShowCalendar(true)}
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
            icon="calendar"
          >
            {formatDate(date)}
          </Button>

          <TextInput
            label="タグ"
            value={newTag}
            onChangeText={setNewTag}
            mode="outlined"
            style={styles.input}
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
            right={
              <TextInput.Icon
                icon="plus"
                onPress={handleAddTag}
                disabled={!newTag.trim()}
              />
            }
          />

          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                onClose={() => handleRemoveTag(index)}
                style={styles.chip}
                mode="flat"
              >
                {tag}
              </Chip>
            ))}
          </View>

          <TextInput
            label="参加者名"
            value={newParticipant}
            onChangeText={setNewParticipant}
            mode="outlined"
            style={[styles.input, tags.length > 0 && styles.inputWithMargin]}
            onSubmitEditing={handleAddParticipant}
            returnKeyType="done"
            right={
              <TextInput.Icon
                icon="plus"
                onPress={handleAddParticipant}
                disabled={!newParticipant.trim()}
              />
            }
          />

          <View style={styles.participantsContainer}>
            {participantNames.map((participant, index) => (
              <Chip
                key={index}
                onClose={() => handleRemoveParticipant(index)}
                style={styles.chip}
                mode="outlined"
              >
                {participant}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleCreateEvent}
        disabled={!eventName.trim() || participantNames.length === 0}
        style={styles.createButton}
        contentStyle={styles.createButtonContent}
      >
        イベントを作成
      </Button>

      <Portal>
        <Modal
          visible={showCalendar}
          onDismiss={() => setShowCalendar(false)}
          contentContainerStyle={styles.calendarContainer}
        >
          <Calendar
            onDayPress={(day) => {
              setDate(new Date(day.timestamp));
              setShowCalendar(false);
            }}
            markedDates={{
              [date.toISOString().split('T')[0]]: { selected: true }
            }}
            theme={{
              todayTextColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
            }}
            firstDay={1}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    gap: 16,
  },
  input: {
    height: 56,
  },
  inputWithMargin: {
    marginTop: 8,
  },
  dateButton: {
    height: 56,
  },
  dateButtonContent: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  createButton: {
    height: 56,
    borderRadius: 8,
  },
  createButtonContent: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
}); 