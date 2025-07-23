export async function redirectBasedOnApplication(navigate: (path: string) => void, supabase: any, userId: string) {
  const { data: application, error } = await supabase
    .from('project_applications')
    .select('id, status')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  const allowedStatuses = [
    'Etude du dossier en cours',
    'Validé',
    'Refusé',
    'Dossier conforme',
  ];

  if (
    !error &&
    application &&
    application.status &&
    allowedStatuses.includes(application.status)
  ) {
    navigate('/application');
  } else {
    navigate('/documentupload');
  }
}
