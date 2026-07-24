import type { Request, Response, Router } from 'express'

export function registerAdminThemeToggleRoute(router: Router, loginPath: string | undefined): void {
  const redirectPath = loginPath ?? '/admin/login'

  router.post('/theme/toggle', (req: Request, res: Response) => {
    const session = req as typeof req & {
      session?: {
        adminUser?: Record<string, unknown> & {
          theme?: string
        }
        save: (callback: (error?: unknown) => void) => void
      }
    }

    if (!session.session?.adminUser) {
      res.redirect(redirectPath)
      return
    }

    const nextTheme = session.session.adminUser.theme === 'dark' ? 'light' : 'dark'

    session.session.adminUser = {
      ...session.session.adminUser,
      theme: nextTheme,
    }

    session.session.save(() => {
      res.sendStatus(204)
    })
  })
}
