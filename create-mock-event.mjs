import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.local 환경 변수 수동 로드
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Supabase 연결 및 사용자 정보 조회 중...');
  
  // 1. host_id로 사용할 유저 조회
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  if (userError) {
    console.error('유저 정보 조회 실패:', userError);
    return;
  }

  let hostId = null;
  if (users && users.length > 0) {
    hostId = users[0].id;
  } else {
    console.error('❌ 등록된 유저가 없습니다. 홈페이지에서 먼저 로그인을 한 번 하신 후 다시 시도해주세요.');
    return;
  }

  const now = new Date();
  
  // 이번 주 목요일(또는 금요일) 저녁 7시반
  const targetDate = new Date(now);
  let daysUntilTarget = (4 - now.getDay() + 7) % 7; // 목요일
  if (daysUntilTarget === 0 && now.getHours() > 19) {
    daysUntilTarget = 7;
  }
  // 현재가 토/일요일이라면 다가오는 수요일로 설정하여 확실히 '이번 주' 느낌이 나게 함
  if (now.getDay() === 0 || now.getDay() === 6) {
      daysUntilTarget = (3 - now.getDay() + 7) % 7; // 수요일
  }

  targetDate.setDate(now.getDate() + daysUntilTarget);
  targetDate.setHours(19, 30, 0, 0);

  const eventData = {
    host_id: hostId,
    title: '🔥 [샘플] 이번 주 청년 연합 기도회',
    description: '이번 주에 진행되는 청년 연합 모임 샘플 데이터입니다. \n이 행사는 테스트를 위해 자동으로 생성되었습니다.',
    category: 'prayer',
    status: 'approved',
    start_at: targetDate.toISOString(),
    end_at: new Date(targetDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    location_type: 'hybrid',
    location_name: '크리스천다이어리 홀',
    location_address: '서울시 서초구 테스트로 123',
    max_participants: 50,
    fee: 0,
    platform_fee_rate: 0,
    is_recurring: false,
    region: '서울',
    church_name: '테스트교회',
    is_featured: true,
    donation_status: 'not_required',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('이번 주 행사 데이터를 생성합니다...');
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('❌ 행사 생성 실패:', error);
  } else {
    console.log('✅ 행사 생성 성공!');
    console.log(`생성된 행사: ${data.title} (${new Date(data.start_at).toLocaleString('ko-KR')})`);
  }
}

main();
