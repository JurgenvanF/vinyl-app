import ThemeSelector from "../components/theme/ThemeSelector";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <ThemeSelector />
    </div>
  );
}
