"use client"


import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { loginSchema } from '@/lib/validations/guest-route-forms'
import { userType } from '@/types/common'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'


type LoginForm = z.infer<typeof loginSchema>
export default function Login() {
    const router = useRouter()
    const searchParam = useSearchParams();


    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            role: undefined
        }
    })

    // async function handleSocialLogin(provider: "google" | "github") {
    //     await socialLogin(provider)
    // }

    async function handleLoginData(formData: LoginForm) {
        startTransition(async () => {
            const validatedFields = loginSchema.safeParse(formData);
            if (!validatedFields.data || validatedFields.error) {
                toast.error("Failed to validate");
                return;
            }
            if (searchParam.get("role")) {
                validatedFields.data.role = userType.ADMIN.toString()
            }

            console.log(validatedFields.data);

            await axios.post("/api/login", validatedFields.data)
                .then((data) => {
                    toast.success(data.data!)
                    loginForm.reset()
                    if (searchParam.get("role")) {
                        router.push("/auth/admin/dashboard")
                        return;
                    }

                    switch (validatedFields.data.role) {
                        case userType.CUSTOMER.toString(): {
                            router.push("/auth/customer/dashboard")
                            break;
                        }
                        case userType.SERVICE_CENTER.toString(): {
                            router.push("/auth/service-center/dashboard")
                            break;
                        }

                        default:
                            toast.error("Invalid Role Selection")
                            break;
                    }
                })
                .catch((error: AxiosError) => {
                    toast.error(error.response?.data as unknown as string)
                })

        })
    }
    return (
        <section className='dark:bg-neutral-800 w-11/12 rounded-md bg-neutral-100 shadow-md flex items-center flex-col sm:w-120'>
            <div>
                <h1 className='text-3xl font-bold leading-tight tracking-tighter p-5'>Sign in to your account</h1>
            </div>
            <div className=' w-full px-4 mt-2'>
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLoginData)} className='space-y-6'>

                        <FormField
                            control={loginForm.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe@example.com" disabled={isPending} type='search' {...field}
                                            className="bg-neutral-50 border-neutral-300 dark:bg-neutral-950 dark:border-neutral-950"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={loginForm.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex items-center justify-between'>
                                        <h3>
                                            Password
                                        </h3>

                                        <Link className="text-zinc-900 underline-offset-4 text-sm  hover:underline cursor-pointer dark:text-zinc-50" href={"/guest/forgot-password"}>
                                            Forgot Password?
                                        </Link>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="*********"
                                            className="bg-neutral-50 border-neutral-300 dark:bg-neutral-950 dark:border-neutral-950"
                                            disabled={isPending} type={showPassword ? `search` : `password`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={loginForm.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger className="bg-neutral-50 border-neutral-300 dark:bg-neutral-950 dark:border-neutral-950 w-full">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value={userType.CUSTOMER.toString()}>
                                                    Customer
                                                </SelectItem>
                                                <SelectItem value={userType.SERVICE_CENTER.toString()}>
                                                    Service Center
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />

                        <div>
                            <div className="flex items-center space-x-2">
                                <Checkbox onClick={() => setShowPassword(!showPassword)} id="showPassword" />
                                <label
                                    htmlFor="showPassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Show Password
                                </label>
                            </div>
                        </div>
                        <Button disabled={isPending} type='submit'>
                            {isPending ? "Loading.." : "Submit"}
                        </Button>

                        {/* <div className="grid grid-cols-2 gap-2">
                            <Button
                                disabled
                                className='flex items-center '
                                onClick={() => handleSocialLogin("google")}
                                type="button"
                            >
                                <Image src={"/google.svg"} width={30} height={30} alt='social-icon' />

                            </Button>
                            <Button
                                disabled
                                type="button"
                                className='flex items-center '
                                onClick={() => handleSocialLogin("github")}
                            >
                                <div className='bg-white rounded-full'>
                                    <Image src={"/github.svg"} width={30} height={30} alt='social-icon' />
                                </div>
                            </Button>
                        </div> */}
                    </form>
                </Form>
            </div>
            <div className='w-full flex items-center justify-center p-3  my-4'>
                <Link className="text-neutral-900 underline-offset-4 font-medium hover:underline dark:text-neutral-50" href={"/guest/Register"}>{"Don't have a Account?"}</Link>
            </div>
        </section>
    )
}