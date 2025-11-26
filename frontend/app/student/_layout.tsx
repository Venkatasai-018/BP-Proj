import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
