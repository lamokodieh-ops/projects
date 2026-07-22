"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS } from "@/lib/utils";

type AlumniForm = {
  fullName: string;
  phone: string;
  graduationYear: number;
  department: string;
  currentCompany: string;
  jobTitle: string;
  location: string;
  bio: string;
  linkedinUrl: string;
  visibility: string;
};

type StudentForm = {
  fullName: string;
  phone: string;
  department: string;
  enrollmentYear: number;
  bio: string;
};

type UserData = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  alumniProfile: {
    graduationYear: number;
    department: string;
    currentCompany: string | null;
    jobTitle: string | null;
    location: string | null;
    bio: string | null;
    linkedinUrl: string | null;
    visibility: string;
  } | null;
  studentProfile: {
    department: string;
    enrollmentYear: number;
    bio: string | null;
  } | null;
};

export function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [alumniForm, setAlumniForm] = useState<AlumniForm | null>(
    user.alumniProfile
      ? {
          fullName: user.fullName,
          phone: user.phone ?? "",
          graduationYear: user.alumniProfile.graduationYear,
          department: user.alumniProfile.department,
          currentCompany: user.alumniProfile.currentCompany ?? "",
          jobTitle: user.alumniProfile.jobTitle ?? "",
          location: user.alumniProfile.location ?? "",
          bio: user.alumniProfile.bio ?? "",
          linkedinUrl: user.alumniProfile.linkedinUrl ?? "",
          visibility: user.alumniProfile.visibility,
        }
      : null
  );

  const [studentForm, setStudentForm] = useState<StudentForm | null>(
    user.studentProfile
      ? {
          fullName: user.fullName,
          phone: user.phone ?? "",
          department: user.studentProfile.department,
          enrollmentYear: user.studentProfile.enrollmentYear,
          bio: user.studentProfile.bio ?? "",
        }
      : null
  );

  const [passwords, setPasswords] = useState({ current: "", next: "" });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const payload = alumniForm ?? studentForm;
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    setMessage(res.ok ? "Profile updated." : "Update failed.");
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    setPasswordMsg(res.ok ? "Password changed." : data.error || "Change failed.");
    if (res.ok) setPasswords({ current: "", next: "" });
  }

  const form = alumniForm ?? studentForm;

  return (
    <div className="space-y-16 mt-10">
      <form onSubmit={saveProfile} className="space-y-8 pb-16 border-b border-navy/[0.08]">
          {form && (
            <>
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (alumniForm) setAlumniForm({ ...alumniForm, fullName: val });
                  if (studentForm) setStudentForm({ ...studentForm, fullName: val });
                }}
              />
              <Input label="Email" value={user.email} disabled />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (alumniForm) setAlumniForm({ ...alumniForm, phone: val });
                  if (studentForm) setStudentForm({ ...studentForm, phone: val });
                }}
              />
            </>
          )}

          {alumniForm && (
            <>
              <Input
                label="Graduation year"
                type="number"
                value={alumniForm.graduationYear}
                onChange={(e) =>
                  setAlumniForm({ ...alumniForm, graduationYear: parseInt(e.target.value) })
                }
              />
              <Select
                label="Department"
                value={alumniForm.department}
                onChange={(e) => setAlumniForm({ ...alumniForm, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <Input
                label="Current company"
                value={alumniForm.currentCompany}
                onChange={(e) => setAlumniForm({ ...alumniForm, currentCompany: e.target.value })}
              />
              <Input
                label="Job title"
                value={alumniForm.jobTitle}
                onChange={(e) => setAlumniForm({ ...alumniForm, jobTitle: e.target.value })}
              />
              <Input
                label="Location"
                value={alumniForm.location}
                onChange={(e) => setAlumniForm({ ...alumniForm, location: e.target.value })}
              />
              <Input
                label="LinkedIn URL"
                value={alumniForm.linkedinUrl}
                onChange={(e) => setAlumniForm({ ...alumniForm, linkedinUrl: e.target.value })}
              />
              <Textarea
                label="Bio"
                value={alumniForm.bio}
                onChange={(e) => setAlumniForm({ ...alumniForm, bio: e.target.value })}
              />
              <Select
                label="Profile visibility"
                value={alumniForm.visibility}
                onChange={(e) => setAlumniForm({ ...alumniForm, visibility: e.target.value })}
              >
                <option value="PUBLIC">Public</option>
                <option value="ALUMNI_ONLY">Alumni only</option>
                <option value="CONNECTIONS_ONLY">Connections only</option>
                <option value="PRIVATE">Private</option>
              </Select>
            </>
          )}

          {studentForm && (
            <>
              <Select
                label="Department"
                value={studentForm.department}
                onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <Input
                label="Enrollment year"
                type="number"
                value={studentForm.enrollmentYear}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, enrollmentYear: parseInt(e.target.value) })
                }
              />
              <Textarea
                label="Bio"
                value={studentForm.bio}
                onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
              />
            </>
          )}

          {message && <p className="text-sm text-navy font-medium">{message}</p>}
          <Button type="submit" disabled={loading}>
            Save changes
          </Button>
        </form>

      <div>
        <h2 className="font-display text-base text-navy mb-8">Change password</h2>
        <form onSubmit={changePassword} className="space-y-8">
          <Input
            label="Current password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            required
          />
          <Input
            label="New password"
            type="password"
            value={passwords.next}
            onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
            minLength={8}
            required
          />
          {passwordMsg && <p className="text-sm text-navy font-medium">{passwordMsg}</p>}
          <Button type="submit">Change password</Button>
        </form>
      </div>
    </div>
  );
}
