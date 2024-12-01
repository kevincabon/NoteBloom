import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { name, color, parent_id } = await request.json();
    
    // Vérifier si l'utilisateur est connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Créer le dossier - les limites sont gérées par les triggers PostgreSQL
    const { data: folder, error: insertError } = await supabase
      .from('folders')
      .insert([
        {
          name,
          color,
          parent_id,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (insertError) {
      // Gérer les erreurs de limite de dossiers
      if (insertError.message.includes('Maximum number of root folders')) {
        return NextResponse.json({ 
          error: 'Root folders limit reached',
          message: 'Vous ne pouvez pas créer plus de 6 dossiers racine'
        }, { status: 400 });
      } else if (insertError.message.includes('Maximum number of subfolders')) {
        return NextResponse.json({ 
          error: 'Subfolders limit reached',
          message: 'Vous ne pouvez pas créer plus de 3 sous-dossiers dans ce dossier'
        }, { status: 400 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { id, name, color, parent_id } = await request.json();
    
    // Vérifier si l'utilisateur est connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mettre à jour le dossier - les limites sont gérées par les triggers PostgreSQL
    const { data: folder, error: updateError } = await supabase
      .from('folders')
      .update({
        name,
        color,
        parent_id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      // Gérer les erreurs de limite de dossiers
      if (updateError.message.includes('Maximum number of root folders')) {
        return NextResponse.json({ 
          error: 'Root folders limit reached',
          message: 'Vous ne pouvez pas créer plus de 6 dossiers racine'
        }, { status: 400 });
      } else if (updateError.message.includes('Maximum number of subfolders')) {
        return NextResponse.json({ 
          error: 'Subfolders limit reached',
          message: 'Vous ne pouvez pas créer plus de 3 sous-dossiers dans ce dossier'
        }, { status: 400 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
