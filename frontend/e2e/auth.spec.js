import { test, expect } from '@playwright/test'

test('login page renders validation and demo access', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Enter your email and password.')).toBeVisible()
  await page.getByRole('button', { name: 'Explore Student demo' }).click()
  await expect(page).toHaveURL(/\/home/)
})

test('invalid login is shown as an API error', async ({ page }) => {
  await page.route('**/api/v1/auth/login', route => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ status: 401, message: 'Invalid email or password' }),
  }))
  await page.goto('/login')
  await page.getByLabel('Email address').fill('invalid@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Incorrect email or password.')).toBeVisible()
})
