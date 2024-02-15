import type { HttpContext } from '@adonisjs/core/http'
import { parseFile, importM3U } from '#services/m_3_u_service'

export default class M3UsController {
  async upload({ request, response }: HttpContext) {
    const rawFile = request.file('m3u')

    if (!rawFile) {
      return response.badRequest('No file uploaded')
    }

    const file: string = await parseFile(rawFile)

    if (file === undefined) {
      return response.badRequest('Invalid file')
    }
    importM3U(file)
  }
}
