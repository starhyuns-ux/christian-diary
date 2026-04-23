import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Supabase Storage에 이미지 업로드
 * @param file 업로드할 파일 객체
 * @param bucket 버킷 이름 (기본: event-images)
 */
export async function uploadImage(file: File, bucket = 'event-images'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}` // events 폴더 지정

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      // 에러 객체를 그대로 던져서 호출부에서 처리하게 함
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Error uploading image:', error)
    // 에러 메시지를 포함하여 toast로 띄울 수 있도록 처리 (optional: 여기서 직접 toast를 띄우지 않고 에러만 전파)
    throw error 
  }
}
