import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
} from "@/features/auth/authApiSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { User, Mail, Phone, Building2, KeyRound } from "lucide-react";

const ResellerProfilePage = () => {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateCurrentUser, { isLoading: isSaving }] = useUpdateCurrentUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      await updateCurrentUser(values).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success("Password updated successfully");
      resetPassword();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };

  if (isLoading && !user) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              My Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your merchant information and contact details.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)] items-start">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Profile details
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Full name"
              placeholder="Enter your name"
              register={register}
              name="name"
              error={errors.name}
              icon={<User className="h-4 w-4" />}
            />

            <TextField
              label="Email"
              placeholder="Enter your email"
              register={register}
              name="email"
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              disabled
            />

            <TextField
              label="Phone"
              placeholder="Enter your phone"
              register={register}
              name="phone"
              error={errors.phone}
              icon={<Phone className="h-4 w-4" />}
            />

            <TextField
              label="Company name"
              placeholder="Enter your company name"
              register={register}
              name="companyName"
              error={errors.companyName}
              icon={<Building2 className="h-4 w-4" />}
              disabled
            />

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>

        {user && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Account overview
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold uppercase text-white">
                  {(user.name || user.fullName || user.email || "?")
                    .toString()
                    .trim()
                    .charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {user.name || user.fullName || "Merchant"}
                  </p>
                  {user.email && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  )}
                  {user.companyName && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.companyName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Role:
                  </span>{" "}
                  {user.role || "RESELLER"}
                </p>
                {user.createdAt && (
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Joined:
                    </span>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <KeyRound className="h-4 w-4" />
                Change password
              </h2>
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-3"
              >
                <TextField
                  label="Current password"
                  type="password"
                  placeholder="Enter current password"
                  register={registerPassword}
                  name="oldPassword"
                  error={passwordErrors.oldPassword}
                />
                <TextField
                  label="New password"
                  type="password"
                  placeholder="Enter new password"
                  register={registerPassword}
                  name="newPassword"
                  error={passwordErrors.newPassword}
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  placeholder="Re-enter new password"
                  register={registerPassword}
                  name="confirmPassword"
                  error={passwordErrors.confirmPassword}
                />
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {isChangingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResellerProfilePage;

