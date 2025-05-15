import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import "./style.scss";
 
export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_role: 'employee',
    });
 
    const submit = (e) => {
        e.preventDefault();
 
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };
 
    return (
        <GuestLayout>
            <Head title="Register" />
 
            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />
 
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
 
                    <InputError message={errors.name} className="mt-2" />
                </div>
 
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
 
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
 
                    <InputError message={errors.password} className="mt-2" />
                </div>
 
                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />
 
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
 
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>
 
                <div className="mt-4">
                    <FormControl component="fieldset">
                         <InputLabel
                        htmlFor="user_role"
                        value="Select Role"
                    />
                        {/* <FormLabel sx={{ fontSize: "small" }} component="legend">Select Role</FormLabel> */}
                        <RadioGroup
                        className='radio-btns'
                            sx={{ display: 'flex', flexDirection: 'row' }}
                            aria-label="user_role"
                            name="user_role"
                            value={data.user_role}
                            onChange={(e) => setData('user_role', e.target.value)}
                            required
                        >
                            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                            <FormControlLabel value="hr" control={<Radio />} label="HR" />
                            <FormControlLabel value="employee" control={<Radio />} label="Employee" />
                        </RadioGroup>
                        <InputError message={errors.user_role} className="mt-2" />
                    </FormControl>
                </div>
 
                <div className="mt-4 flex items-center justify-center">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>
 
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}