// [신청 폼 정의] 화면(src/js/visit.js)과 서버 검증(server/app.ts)이 모두 이 파일을 읽는다.
// 현장에서 수정 가능: 라벨, 필수 여부, 안내문구, 글자수, 연락처 패턴, title.
// 제한: 항목 이름은 name / phone / message 만 사용한다(DB 컬럼 고정). 항목 추가는 S3 이후 논의.
// 개인정보 동의문의 '수집 항목'은 아래 fields 의 label 로 자동 생성되므로 폼과 어긋나지 않는다.
export const FORM = {
  title: '관심고객등록', // 방문예약형 현장은 '방문예약'
  submitLabel: '신청하기',
  successMessage: '신청이 접수되었습니다. 곧 연락드리겠습니다.',
  fields: [
    { name: 'name', label: '성함', type: 'text', required: true, maxLength: 50 },
    {
      name: 'phone', label: '연락처', type: 'tel', required: true, maxLength: 20,
      placeholder: '010-0000-0000',
      pattern: '^[0-9\\-+\\s]{8,20}$', patternMessage: '연락처 형식이 올바르지 않습니다.',
    },
    { name: 'message', label: '문의사항', type: 'textarea', required: false, maxLength: 2000 },
  ],
}
