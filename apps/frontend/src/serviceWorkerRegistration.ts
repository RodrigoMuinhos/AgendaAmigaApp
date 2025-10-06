export async function precacheProximasDoses<T>(task: () => Promise<T>): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error("Falha ao precachear próximas doses", error);
  }
}
