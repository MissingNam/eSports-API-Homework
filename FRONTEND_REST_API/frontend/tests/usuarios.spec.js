// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:3000/api/v1'
const PASS = 'Prueba1234'

// Cada ejecución crea correos únicos: no choca con cuentas anteriores ni entre tests paralelos
const correoNuevo = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 10000)}@correo.com`

// @ts-ignore
async function completarRegistro(page, email, password = PASS, confirmar = password) {
  await page.goto('/registro')
  await page.getByLabel('Nombre', { exact: true }).fill('Usuario E2E')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByLabel('Confirmar contraseña').fill(confirmar)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
}

// @ts-ignore
async function registrarUsuario(page) {
  const email = correoNuevo()
  await completarRegistro(page, email)
  await expect(page).toHaveURL(/\/jugadores$/)
  return email
}

test.describe('Registro y login de usuario', () => {
  test('registrar, cerrar sesión y volver a entrar con el correo', async ({ page }) => {
    const email = await registrarUsuario(page)

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.getByLabel('Usuario').fill(email)
    await page.getByLabel('Contraseña').fill(PASS)
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
    await expect(page).toHaveURL(/\/jugadores$/)

    // Registrar el mismo correo otra vez debe fallar
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await completarRegistro(page, email)
    await expect(page.getByText('Ya existe una cuenta con ese correo')).toBeVisible()
  })

  test('contraseñas distintas muestran un aviso sin llamar al servidor', async ({ page }) => {
    await completarRegistro(page, correoNuevo(), PASS, 'OtraClave123')
    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible()
    await expect(page).toHaveURL(/\/registro$/)
  })

  test('el botón de Google apunta al login del backend', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: 'Iniciar sesión con Google' }))
      .toHaveAttribute('href', /\/auth\/google\/login$/)
  })

  test('?error=google muestra el aviso en el login', async ({ page }) => {
    await page.goto('/login?error=google')
    await expect(page.getByText('No se pudo iniciar sesión con Google')).toBeVisible()
  })
})

test.describe('Panel de visualización (usuario)', () => {
  test.beforeEach(async ({ page }) => {
    await registrarUsuario(page)
  })

  test('solo ve las pestañas Jugadores y Roster, y el título de visualización', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Panel de Visualización' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jugadores', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Roster', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Inicio', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Recursos', exact: true })).toHaveCount(0)
  })

  test('las rutas de admin lo devuelven a Jugadores', async ({ page }) => {
    await page.goto('/recursos')
    await expect(page).toHaveURL(/\/jugadores$/)
    await page.goto('/')
    await expect(page).toHaveURL(/\/jugadores$/)
  })

  test('Jugadores: puede buscar, pero no ve controles de edición', async ({ page }) => {
    await expect(page.getByPlaceholder('Buscar jugador por nickname...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Añadir jugador' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^(Eliminar|Editar) a / })).toHaveCount(0)

    await page.getByPlaceholder('Buscar jugador por nickname...').fill('zzz-no-existe-zzz')
    await expect(page.getByText('Ningún jugador coincide con la búsqueda.')).toBeVisible()
  })

  test('Roster: puede desplegar, pero no ve controles de edición', async ({ page }) => {
    await page.getByRole('link', { name: 'Roster', exact: true }).click()
    await expect(page.getByPlaceholder('Buscar roster por nombre...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Añadir roster' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^(Eliminar|Editar) el roster/ })).toHaveCount(0)

    // Si hay algún roster, se despliega y se comprueba su contenido de solo lectura
    const primero = page.locator('button[aria-expanded]').first()
    if (await primero.count()) {
      await primero.click()
      await expect(page.getByText('Cargando jugadores...')).toBeHidden()
      await expect(page.getByRole('button', { name: /^Quitar a / })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Añadir jugador al roster' })).toHaveCount(0)
      await expect(page.getByRole('combobox', { name: /^Rol de .* en el roster$/ })).toHaveCount(0)
    }
  })

  test('el servidor rechaza una escritura de usuario con 403', async ({ page }) => {
    // Comprueba la autorización real, no solo que los botones estén ocultos.
    // page.request comparte las cookies de la sesión del navegador.
    const me = await (await page.request.get(`${API}/auth/me`)).json()
    expect(me.rol).toBe('usuario')

    const r = await page.request.post(`${API}/jugadores`, {
      headers: { 'X-CSRF-Token': me.csrfToken },
      data: { nickname: 'Intruso', rol: 'Mid' }
    })
    expect(r.status()).toBe(403)
  })
})