import { useState } from 'react'
import { Alert, Box, Button, Card, Checkbox, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../store/authSlice'
import { loginApi } from '../../services/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid work email.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError('')
    try {
      const user = await loginApi(values.email, values.password, values.remember ?? false)
      dispatch(
        login({
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
        }),
      )
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'radial-gradient(circle at top, rgba(87, 126, 255, 0.2), transparent 35%), background.default',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.3, fontWeight: 700 }}>
              TRACKIN360
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, lineHeight: 1.1 }}>
              Know where your people are.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Real-time workforce visibility, attendance and location intelligence.
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {loginError && <Alert severity="error">{loginError}</Alert>}
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((value) => !value)} edge="end" aria-label="toggle password visibility">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel control={<Checkbox defaultChecked {...register('remember')} />} label="Remember me" />
                <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </Typography>
              </Box>

              <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.4 }}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}

export default LoginPage
