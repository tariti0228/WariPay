import { Stack, router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { YStack, Text, H1, Paragraph, Button, Card } from 'tamagui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '画面が見つかりません' }} />
      <SafeAreaView>
        <YStack
          flex={1}
          style={{ padding: 16, gap: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <Card>
            <Card.Header padded>
              <H1 color="$red10">404</H1>
            </Card.Header>
            <Card.Footer padded>
              <YStack gap="$2">
                <Text fontSize="$6" fontWeight="bold">
                  画面が見つかりません
                </Text>
                <Paragraph>
                  お探しの画面は存在しないか、移動した可能性があります。
                </Paragraph>
              </YStack>
            </Card.Footer>
          </Card>

          <Button onPress={() => router.push('/')}> 
            トップに戻る
          </Button>
        </YStack>
      </SafeAreaView>
    </>
  );
}

