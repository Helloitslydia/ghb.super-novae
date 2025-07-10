export async function redirectBasedOnApplication(navigate: (path: string) => void, supabase: any, userId: string) {
  const { data: application, error } = await supabase
    .from('project_applications')
    .select('id, status')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (!error && application && application.status && application.status !== 'Brouillon') {
    navigate('/application');
  } else {
    navigate('/documentupload');
  }
}
