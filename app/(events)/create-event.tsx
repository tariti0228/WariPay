import { createEvent } from '@/src/db/queries/events';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Button, Card, Chip, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';

export default function CreateEventScreen() {
  const theme = useTheme();
  const [eventName, setEventName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isParticipantModalVisible, setIsParticipantModalVisible] = useState(false);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
      setIsParticipantModalVisible(false);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setIsTagModalVisible(false);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      return;
    }

    try {
      await createEvent({
        name: eventName,
        tags: tags.join(','),
        participantNames: participants,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="イベント作成" />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <TextInput
              label="イベント名"
              value={eventName}
              onChangeText={setEventName}
              mode="outlined"
              style={{ marginBottom: 16 }}
            />

            <View style={{ marginBottom: 16 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>参加者</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {participants.map((participant, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveParticipant(index)}
                    style={{ marginRight: 8 }}
                  >
                    {participant}
                  </Chip>
                ))}
                <Chip
                  icon="plus"
                  onPress={() => setIsParticipantModalVisible(true)}
                >
                  追加
                </Chip>
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>タグ</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveTag(index)}
                    style={{ marginRight: 8 }}
                  >
                    {tag}
                  </Chip>
                ))}
                <Chip
                  icon="plus"
                  onPress={() => setIsTagModalVisible(true)}
                >
                  追加
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleCreateEvent}
          disabled={!eventName.trim()}
          style={{ marginTop: 16 }}
        >
          イベントを作成
        </Button>
      </ScrollView>

      <Portal>
        <Modal
          visible={isParticipantModalVisible}
          onDismiss={() => setIsParticipantModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
          }}
        >
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>参加者を追加</Text>
          <TextInput
            label="参加者名"
            value={newParticipant}
            onChangeText={setNewParticipant}
            mode="outlined"
            style={{ marginBottom: 16 }}
          />
          <Button mode="contained" onPress={handleAddParticipant}>
            追加
          </Button>
        </Modal>

        <Modal
          visible={isTagModalVisible}
          onDismiss={() => setIsTagModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
          }}
        >
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>タグを追加</Text>
          <TextInput
            label="タグ"
            value={newTag}
            onChangeText={setNewTag}
            mode="outlined"
            style={{ marginBottom: 16 }}
          />
          <Button mode="contained" onPress={handleAddTag}>
            追加
          </Button>
        </Modal>
      </Portal>
    </View>
  );
} 