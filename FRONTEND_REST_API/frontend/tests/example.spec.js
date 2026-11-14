// @ts-check
import { test, expect } from '@playwright/test'

// Credenciales de un admin que YA exista en tu BD (se pueden pasar por variables de entorno)
const USER = process.env.E2E_USER ?? 'admin'
const PASS = process.env.E2E_PASS ?? '12345678'


// @ts-ignore
async function iniciarSesion(page) {
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(USER)
  await page.getByLabel('Contraseña').fill(PASS)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Bienvenido/ })).toBeVisible()
}

test.describe('Acceso', () => {
  test('la pantalla de login tiene el título correcto', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Panel de Administración')
  })

  test('sin sesión, el panel redirige al login', async ({ page }) => {
    await page.goto('/jugadores')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('credenciales incorrectas muestran un error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Usuario').fill(USER)
    await page.getByLabel('Contraseña').fill('contraseña-incorrecta')
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
    await expect(page.getByText('Credenciales inválidas')).toBeVisible()
  })
})

test.describe('Pestaña Jugadores', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page)
  })

  test('la pestaña lleva a la pantalla de jugadores', async ({ page }) => {
    await page.getByRole('link', { name: 'Jugadores', exact: true }).click()

    await expect(page).toHaveURL(/\/jugadores$/)
    await expect(page.getByRole('heading', { name: 'Jugadores', level: 2 })).toBeVisible()
    await expect(page.getByPlaceholder('Buscar jugador por nickname...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Añadir jugador' })).toBeVisible()
  })

  test('el botón + abre el formulario y Cancelar lo cierra', async ({ page }) => {
    await page.getByRole('link', { name: 'Jugadores', exact: true }).click()
    await page.getByRole('button', { name: 'Añadir jugador' }).click()

    const ventana = page.getByRole('dialog')
    await expect(ventana.getByRole('heading', { name: 'Nuevo jugador' })).toBeVisible()

    await ventana.getByRole('button', { name: 'Cancelar' }).click()
    await expect(ventana).toBeHidden()
  })

  test('buscar un jugador inexistente muestra el aviso', async ({ page }) => {
    await page.getByRole('link', { name: 'Jugadores', exact: true }).click()
    await page.getByPlaceholder('Buscar jugador por nickname...').fill('zzz-no-existe-zzz')

    await expect(page.getByText('Ningún jugador coincide con la búsqueda.')).toBeVisible()
  })
})