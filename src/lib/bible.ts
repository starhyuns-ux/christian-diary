export interface BibleVerse {
  text: string
  reference: string
}

export const DAILY_VERSES: BibleVerse[] = [
  {
    text: "너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라",
    reference: "에베소서 2:22"
  },
  {
    text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
    reference: "빌립보서 4:13"
  },
  {
    text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라",
    reference: "잠언 3:5"
  },
  {
    text: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
    reference: "로마서 8:28"
  },
  {
    text: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라",
    reference: "이사야 41:10"
  },
  {
    text: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
    reference: "시편 23:1"
  },
  {
    text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    reference: "데살로니가전서 5:16-18"
  }
]

export function getRandomVerse(): BibleVerse {
  // 날짜 기반으로 매일 같은 말씀이 나오게 하거나 진짜 랜덤하게 가능
  // 여기서는 단순 랜덤
  const index = Math.floor(Math.random() * DAILY_VERSES.length)
  return DAILY_VERSES[index]
}
