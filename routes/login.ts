import { clearAbuse, recordAbuse } from '@cityssm/express-abuse-points'
import Debug from 'debug'
import { type Request, type Response, Router } from 'express'

import addUser from '../database/users/addUser.js'
import { getUserCount } from '../database/users/getUsers.js'
import updateUser from '../database/users/updateUser.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import {
  authenticate,
  getSafeRedirectUrl
} from '../helpers/authentication.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { getUser, SYSTEM_USER } from '../helpers/user.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:routes:login`)

export const router = Router()

let knownUserCount = await getUserCount()

function getHandler(request: Request, response: Response): void {
  const sessionCookieName = getConfigProperty('session.cookieName')

  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    const redirectUrl = getSafeRedirectUrl(
      (request.query.redirect ?? '') as string
    )

    response.redirect(redirectUrl)
  } else {
    response.render('login', {
      message: '',
      redirect: request.query.redirect,
      userName: ''
    })
  }
}

async function postHandler(
  request: Request<
    unknown,
    unknown,
    { password: string; redirect: string; userName: string }
  >,
  response: Response
): Promise<void> {
  const userName =
    typeof request.body.userName === 'string' ? request.body.userName : ''

  const passwordPlain =
    typeof request.body.password === 'string' ? request.body.password : ''

  const unsafeRedirectUrl = request.body.redirect

  const redirectUrl = getSafeRedirectUrl(
    typeof unsafeRedirectUrl === 'string' ? unsafeRedirectUrl : ''
  )

  /*
   * Authenticate User
   */

  const isAuthenticated = await authenticate(userName, passwordPlain)

  /*
   * Get User Object
   */

  let userObject: User | undefined

  if (isAuthenticated) {
    userObject = await getUser(userName)
  }

  if (isAuthenticated && userObject === undefined && knownUserCount === 0) {
    knownUserCount = await getUserCount()

    if (knownUserCount === 0) {
      debug(`Creating initial admin user: ${userName}`)

      const success = await addUser(userName, SYSTEM_USER)

      if (success) {
        knownUserCount = 1

        await updateUser(
          {
            userName,
            isActive: true,

            shifts_canView: false,
            shifts_canUpdate: false,
            shifts_canManage: false,

            workOrders_canView: false,
            workOrders_canUpdate: false,
            workOrders_canManage: false,

            timesheets_canView: false,
            timesheets_canUpdate: false,
            timesheets_canManage: false,

            isAdmin: true
          },
          SYSTEM_USER
        )

        userObject = await getUser(userName)
      }
    }
  }

  if (isAuthenticated && userObject !== undefined) {
    clearAbuse(request as unknown as Express.Request)

    request.session.user = userObject

    response.redirect(redirectUrl)
  } else {
    recordAbuse(request as unknown as Express.Request)

    response.render('login', {
      message: 'Login Failed',
      redirect: redirectUrl,
      userName
    })
  }
}

router.route('/').get(getHandler).post(postHandler)

export default router
