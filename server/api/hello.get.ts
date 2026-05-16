export default defineEventHandler(() => {
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const numbers = [3, 7, 2, 9]
  const sum = numbers.reduce((acc, n) => acc + n, 0)
  const logicResult = sum % 2 === 0 ? 'Sum is even' : 'Sum is odd'

  return {
    message: 'Hello World',
    greeting,
    serverTime: now.toISOString(),
    logicResult
  }
})