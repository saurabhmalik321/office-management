import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Typography} from '@mui/material';
 
export default function AdminLogin({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
 
    const submit = (e) => {
        e.preventDefault();
 
        post(route('admin.login.attempt'), {
            onFinish: () => reset('password'),
        });
    };
 
    return (
        <Box>
            <Box>
                <Link
                    style={{
                        color: 'black',
                        position: 'absolute',
                        top: '23px',
                        right: '28px',
                        border: '1px solid gray',
                        padding: '4px 24px'
                    }}
                    href={route('register')}
                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                >
                    Register
                </Link>
            </Box>
            <GuestLayout>
 
                <Head title="Log in" />
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
 
                <form onSubmit={submit}>
                    <div>
                         <Typography variant="h6" sx={{justifyContent : 'center' , display : "flex"}} component="h2">
                            Admin Login
                        </Typography>
                         {errors.email && <Alert severity="error">{errors.email}</Alert>}
                        <InputLabel htmlFor="email" value="Email" />
 
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
 
                        <InputError message={errors.email} className="mt-2" />
                    </div>
 
                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
 
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
 
                        <InputError message={errors.password} className="mt-2" />
                    </div>
 
                    <div className="mt-4 block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>
                    </div>
 
                    <div className="mt-4 flex items-center justify-end">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Forgot your password?
                            </Link>
                        )}
 
                        <PrimaryButton className="ms-4" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </GuestLayout>
        </Box>
 
    );
}