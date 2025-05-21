
import { supabase } from '../supabase'

export async function getInstitutionProfile(id: string) {
  const { data: profile, error: profileError } = await supabase
    .from('institution_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError) return null

  const { data: events } = await supabase
    .from('institution_events')
    .select('*')
    .eq('institution_id', id)

  const { data: gallery } = await supabase
    .from('institution_gallery')
    .select('*')
    .eq('institution_id', id)

  const { data: programs } = await supabase
    .from('institution_programs')
    .select('*')
    .eq('institution_id', id)

  return {
    institution: {
      name: profile.institution_name,
      type: profile.institution_type,
      stats: {
        events: events?.length || 0,
        programs: programs?.length || 0,
        gallery: gallery?.length || 0
      },
      contact: {
        website: profile.website
      }
    },
    events: events || [],
    gallery: gallery || [],
    programs: programs || []
  }
}
