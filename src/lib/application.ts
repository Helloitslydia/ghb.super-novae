export async function redirectBasedOnApplication(navigate: (path: string) => void, supabase: any, userId: string) {
  const { data: application, error } = await supabase
    .from('project_applications')
    .select('id, status')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  const statusPageStatuses = [
    'Etude du dossier en cours',
    'Validé',
    'Refusé',
    'Dossier conforme',
    'Elements manquants',
    'Dossier refusé',
  ];

  if (!error && application && application.status) {
    if (application.status === 'Brouillon') {
      navigate('/documentupload');
      return;
    }
    if (statusPageStatuses.includes(application.status)) {
      navigate('/application');
      return;
    }
  }
  navigate('/documentupload');
}
