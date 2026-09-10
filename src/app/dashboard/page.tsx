import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjectsAction, createProjectAction } from "@/actions/projects";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projectsResult = await getProjectsAction();
  let projects = projectsResult.success && projectsResult.data ? projectsResult.data : [];

  // Guarantee at least one default project exists for a seamless first-time experience
  if (projects.length === 0) {
    const created = await createProjectAction({
      name: "Mon premier projet",
      color: "#6366F1",
    });
    if (created.success) {
      const refreshed = await getProjectsAction();
      if (refreshed.success && refreshed.data) {
        projects = refreshed.data;
      }
    }
  }

  return (
    <DashboardClient
      initialUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      initialProjects={projects}
    />
  );
}
