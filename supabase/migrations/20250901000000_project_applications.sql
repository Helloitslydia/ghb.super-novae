/*
  # Create table to store project application form data

  1. New Table
    - project_applications
      - id (uuid primary key)
      - user_id (uuid fk to auth.users unique)
      - many text/number fields for the form
      - created_at

  2. Security
    - Enable RLS
    - Allow authenticated users to manage their own rows
*/

CREATE TABLE IF NOT EXISTS project_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  siret text NOT NULL,
  pacage text,
  ede text,
  inuav1 text,
  inuav2 text,
  inuav3 text,
  nom text,
  statut text,
  adresse text,
  code_postal text,
  commune text,
  tel_fixe text,
  tel_mobile text,
  email text,
  affiliation_msa boolean,
  sau_totale text,
  production_maraichage boolean,
  surface_maraichage text,
  production_bovins boolean,
  bovins_nombre text,
  production_volailles boolean,
  volailles_effectif text,
  autres_production text,
  besoin_actuel text,
  besoin_prospectif text,
  capacite_actuelle text,
  detail_stockage text,
  capacite_besoins_actuels text,
  capacite_besoins_prospectifs text,
  volume_total_investissement text,
  micro_surface text,
  micro_volume text,
  cuve_nombre text,
  cuve_vol_unitaire text,
  cuve_vol_total text,
  citerne_nombre text,
  citerne_vol_unitaire text,
  citerne_vol_total text,
  water_tank_volume text,
  volume_stockage_actuel text,
  volume_stockage_total_post text,
  surface_impluvium text,
  cout_total_projet text,
  depense_nature text,
  depense_cout text,
  depense_terrassement text,
  depense_pose text,
  depense_raccordement text,
  depense_pompage text,
  attestation boolean,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own applications"
  ON project_applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
