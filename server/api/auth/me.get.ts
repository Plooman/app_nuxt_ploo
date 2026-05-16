import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  return await requireUser(event)
})
