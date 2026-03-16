'use client'

import { useState, useEffect, useCallback } from 'react'

const CATEGORIES: Record<string, string> = {
  '': '전체',
  briefing: '태국뉴스',
  incident: '사건사고',
  local_tip: '생활정보',
  visa_info: '비자정보',
  job: '구인구직',
  market: '중고마켓',
  anonymous_tip: '익명제보',
}

const STATUS_LABELS: Record<string, string> = {
  SAFE: '정상',
  HIDDEN: '숨김',
  BLOCKED: '차단',
}

interface Post {
  id: string
  authorId: string
  category: string
  title: string
  content: string
  isAnonymous: boolean
  moderationStatus: string
  viewCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 게시글 관리
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(false)

  // 편집 모달
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)

  // 상세 보기
  const [viewPost, setViewPost] = useState<Post | null>(null)

  // 삭제 확인
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)

  // 탭
  const [tab, setTab] = useState<'posts' | 'local' | 'stats'>('posts')

  // 로컬추천 관리
  const [localBiz, setLocalBiz] = useState<any[]>([])
  const [localLoading, setLocalLoading] = useState(false)
  const [showLocalForm, setShowLocalForm] = useState(false)
  const [editLocal, setEditLocal] = useState<any>(null)
  const [localForm, setLocalForm] = useState({
    name: '', category: '맛집', region: '방콕', address: '', priceRange: '',
    description: '', discount: '', imageUrl: '', emoji: '🏪', phone: '', lineId: '',
    kakaoId: '', mapUrl: '', tags: '', isRecommended: false,
  })

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setToken(data.token)
        setIsLoggedIn(true)
        setLoginError('')
        sessionStorage.setItem('admin_token', data.token)
      } else {
        setLoginError(data.error || '로그인 실패')
      }
    } catch {
      setLoginError('서버 연결 실패')
    }
  }

  const fetchPosts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(filterCategory && { category: filterCategory }),
      })
      const res = await fetch(`/api/admin/community?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [token, page, search, filterCategory])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token')
    if (saved) {
      setToken(saved)
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchPosts()
  }, [isLoggedIn, fetchPosts])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const openEdit = (post: Post) => {
    setEditPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditCategory(post.category)
    setEditStatus(post.moderationStatus)
  }

  const handleSave = async () => {
    if (!editPost) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editPost.id,
          title: editTitle,
          content: editContent,
          category: editCategory,
          moderationStatus: editStatus,
        }),
      })
      if (res.ok) {
        setEditPost(null)
        fetchPosts()
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/community?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteTarget(null)
        fetchPosts()
      }
    } catch { /* ignore */ }
  }

  const fetchLocal = useCallback(async () => {
    if (!token) return
    setLocalLoading(true)
    try {
      const res = await fetch('/api/local')
      const data = await res.json()
      if (Array.isArray(data)) setLocalBiz(data)
    } catch { /* ignore */ }
    setLocalLoading(false)
  }, [token])

  useEffect(() => {
    if (isLoggedIn && tab === 'local') fetchLocal()
  }, [isLoggedIn, tab, fetchLocal])

  const resetLocalForm = () => {
    setLocalForm({
      name: '', category: '맛집', region: '방콕', address: '', priceRange: '',
      description: '', discount: '', imageUrl: '', emoji: '🏪', phone: '', lineId: '',
      kakaoId: '', mapUrl: '', tags: '', isRecommended: false,
    })
    setEditLocal(null)
    setShowLocalForm(false)
  }

  const openLocalEdit = (biz: any) => {
    setEditLocal(biz)
    setLocalForm({
      name: biz.name || '', category: biz.category || '맛집', region: biz.region || '방콕',
      address: biz.address || '', priceRange: biz.priceRange || '', description: biz.description || '',
      discount: biz.discount || '', imageUrl: biz.imageUrl || '', emoji: biz.emoji || '🏪',
      phone: biz.phone || '', lineId: biz.lineId || '', kakaoId: biz.kakaoId || '',
      mapUrl: biz.mapUrl || '', tags: (biz.tags || []).join(', '), isRecommended: biz.isRecommended || false,
    })
    setShowLocalForm(true)
  }

  const handleLocalSave = async () => {
    setSaving(true)
    const body = {
      ...localForm,
      tags: localForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      hasDiscount: !!localForm.discount,
      ...(editLocal && { id: editLocal.id }),
    }
    try {
      const res = await fetch('/api/local', {
        method: editLocal ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) { resetLocalForm(); fetchLocal() }
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleLocalDelete = async (id: string) => {
    if (!confirm('업소를 삭제하시겠습니까?')) return
    try {
      await fetch(`/api/local?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchLocal()
    } catch { /* ignore */ }
  }

  const handleLogout = () => {
    setToken('')
    setIsLoggedIn(false)
    sessionStorage.removeItem('admin_token')
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{
          background: '#fff', borderRadius: 12, padding: 40, width: 380,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 60, height: 60, background: '#145A46', borderRadius: 12,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 16
            }}>태</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>태자월드 관리자</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>관리자 비밀번호를 입력하세요</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호"
            style={{
              width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8,
              fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none',
            }}
          />
          {loginError && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 12px' }}>{loginError}</p>}
          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '12px 0', background: '#145A46', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >로그인</button>
        </div>
      </div>
    )
  }

  // 관리자 대시보드
  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* 헤더 */}
      <header style={{
        background: '#145A46', color: '#fff', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>태자월드 관리자</span>
          <span style={{
            background: 'rgba(255,255,255,0.2)', padding: '2px 10px',
            borderRadius: 12, fontSize: 12
          }}>총 {total}건</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setTab('posts')} style={{
            background: tab === 'posts' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6,
            cursor: 'pointer', fontSize: 14
          }}>게시글 관리</button>
          <button onClick={() => setTab('local')} style={{
            background: tab === 'local' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6,
            cursor: 'pointer', fontSize: 14
          }}>로컬추천</button>
          <button onClick={() => setTab('stats')} style={{
            background: tab === 'stats' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6,
            cursor: 'pointer', fontSize: 14
          }}>통계</button>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13
          }}>로그아웃</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        {tab === 'posts' && (
          <>
            {/* 검색/필터 바 */}
            <div style={{
              background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16,
              display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <select
                value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
                style={{
                  padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6,
                  fontSize: 14, background: '#fff', cursor: 'pointer'
                }}
              >
                {Object.entries(CATEGORIES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="제목 또는 내용 검색..."
                style={{
                  flex: 1, minWidth: 200, padding: '8px 14px', border: '1px solid #ddd',
                  borderRadius: 6, fontSize: 14, outline: 'none'
                }}
              />
              <button onClick={handleSearch} style={{
                padding: '8px 20px', background: '#145A46', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer'
              }}>검색</button>
              <button onClick={() => { setSearch(''); setSearchInput(''); setFilterCategory(''); setPage(1) }} style={{
                padding: '8px 16px', background: '#eee', color: '#333',
                border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer'
              }}>초기화</button>
            </div>

            {/* 게시글 목록 */}
            <div style={{
              background: '#fff', borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>불러오는 중...</div>
              ) : posts.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>게시글이 없습니다</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, width: 90 }}>카테고리</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>제목</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 70 }}>상태</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 60 }}>조회</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 140 }}>작성일</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 140 }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                            fontSize: 12, fontWeight: 500,
                            background: post.category === 'briefing' ? '#e8f5e9' : post.category === 'incident' ? '#ffebee' : '#f3f4f6',
                            color: post.category === 'briefing' ? '#145A46' : post.category === 'incident' ? '#c62828' : '#555',
                          }}>
                            {CATEGORIES[post.category] || post.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', cursor: 'pointer' }} onClick={() => setViewPost(post)}>
                          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>
                            {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                          </span>
                          <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                            {post.authorId === 'newsbot-system' ? '[뉴스봇]' : `[${post.authorId}]`}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: post.moderationStatus === 'SAFE' ? '#e8f5e9' : post.moderationStatus === 'HIDDEN' ? '#fff3e0' : '#ffebee',
                            color: post.moderationStatus === 'SAFE' ? '#2e7d32' : post.moderationStatus === 'HIDDEN' ? '#ef6c00' : '#c62828',
                          }}>
                            {STATUS_LABELS[post.moderationStatus] || post.moderationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#666' }}>{post.viewCount}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#888', fontSize: 13 }}>
                          {formatDate(post.createdAt)}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <button onClick={() => openEdit(post)} style={{
                            padding: '4px 10px', background: '#e3f2fd', color: '#1565c0',
                            border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer', marginRight: 6
                          }}>수정</button>
                          <button onClick={() => setDeleteTarget(post)} style={{
                            padding: '4px 10px', background: '#ffebee', color: '#c62828',
                            border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer'
                          }}>삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 8, padding: '16px',
                  borderTop: '1px solid #eee'
                }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{
                      padding: '6px 14px', border: '1px solid #ddd', borderRadius: 6,
                      background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: page <= 1 ? 0.5 : 1, fontSize: 13
                    }}
                  >이전</button>
                  <span style={{ padding: '6px 14px', fontSize: 14, color: '#555' }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      padding: '6px 14px', border: '1px solid #ddd', borderRadius: 6,
                      background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                      opacity: page >= totalPages ? 0.5 : 1, fontSize: 13
                    }}
                  >다음</button>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'local' && (
          <>
            {/* 로컬 업소 등록/수정 폼 */}
            {showLocalForm && (
              <div style={{
                background: '#fff', borderRadius: 10, padding: 24, marginBottom: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  {editLocal ? '업소 수정' : '새 업소 등록'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>업소명 *</label>
                    <input value={localForm.name} onChange={e => setLocalForm({...localForm, name: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>카테고리</label>
                    <select value={localForm.category} onChange={e => setLocalForm({...localForm, category: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}>
                      {['마사지', '맛집', '무까따', '카페', '서비스'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>지역</label>
                    <select value={localForm.region} onChange={e => setLocalForm({...localForm, region: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}>
                      {['방콕', '파타야', '치앙마이', '푸켓', '후아힌'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>이모지</label>
                    <input value={localForm.emoji} onChange={e => setLocalForm({...localForm, emoji: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>주소</label>
                    <input value={localForm.address} onChange={e => setLocalForm({...localForm, address: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>가격대</label>
                    <input value={localForm.priceRange} onChange={e => setLocalForm({...localForm, priceRange: e.target.value})}
                      placeholder="200~400 THB" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>할인 혜택</label>
                    <input value={localForm.discount} onChange={e => setLocalForm({...localForm, discount: e.target.value})}
                      placeholder="태자 회원 20% 할인" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>대표 사진 URL</label>
                    <input value={localForm.imageUrl} onChange={e => setLocalForm({...localForm, imageUrl: e.target.value})}
                      placeholder="https://example.com/photo.jpg" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                    {localForm.imageUrl && (
                      <img src={localForm.imageUrl} alt="미리보기" style={{ marginTop: 8, maxWidth: 200, maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>설명</label>
                    <textarea value={localForm.description} onChange={e => setLocalForm({...localForm, description: e.target.value})}
                      rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>전화번호</label>
                    <input value={localForm.phone} onChange={e => setLocalForm({...localForm, phone: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Line ID</label>
                    <input value={localForm.lineId} onChange={e => setLocalForm({...localForm, lineId: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>카카오톡 ID</label>
                    <input value={localForm.kakaoId} onChange={e => setLocalForm({...localForm, kakaoId: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>지도 URL</label>
                    <input value={localForm.mapUrl} onChange={e => setLocalForm({...localForm, mapUrl: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>태그 (쉼표로 구분)</label>
                    <input value={localForm.tags} onChange={e => setLocalForm({...localForm, tags: e.target.value})}
                      placeholder="한국어 가능, 주차 가능, 예약 가능" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={localForm.isRecommended}
                        onChange={e => setLocalForm({...localForm, isRecommended: e.target.checked})} />
                      <span style={{ fontSize: 13 }}>⭐ 추천 업소</span>
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={resetLocalForm} style={{
                    padding: '8px 20px', background: '#eee', color: '#333',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
                  }}>취소</button>
                  <button onClick={handleLocalSave} disabled={saving || !localForm.name} style={{
                    padding: '8px 24px', background: '#145A46', color: '#fff',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    opacity: (!localForm.name || saving) ? 0.5 : 1
                  }}>{saving ? '저장 중...' : (editLocal ? '수정 저장' : '등록')}</button>
                </div>
              </div>
            )}

            {/* 업소 등록 버튼 */}
            {!showLocalForm && (
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button onClick={() => { resetLocalForm(); setShowLocalForm(true) }} style={{
                  padding: '10px 20px', background: '#145A46', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>+ 새 업소 등록</button>
              </div>
            )}

            {/* 업소 목록 */}
            <div style={{
              background: '#fff', borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {localLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>불러오는 중...</div>
              ) : localBiz.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>등록된 업소가 없습니다</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, width: 40 }}></th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>업소명</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 80 }}>카테고리</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 70 }}>지역</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 80 }}>사진</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 70 }}>추천</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, width: 130 }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localBiz.map(biz => (
                      <tr key={biz.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 16px', fontSize: 20 }}>{biz.emoji}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{biz.name}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>{biz.address}</div>
                          {biz.discount && <div style={{ fontSize: 11, color: '#F2994A', fontWeight: 600, marginTop: 2 }}>🎫 {biz.discount}</div>}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#f3f4f6', color: '#555' }}>{biz.category}</span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#666', fontSize: 13 }}>{biz.region}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {biz.imageUrl ? (
                            <img src={biz.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', margin: '0 auto' }} />
                          ) : (
                            <span style={{ color: '#ccc', fontSize: 12 }}>없음</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {biz.isRecommended ? <span style={{ color: '#F2994A' }}>⭐</span> : <span style={{ color: '#ddd' }}>-</span>}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <button onClick={() => openLocalEdit(biz)} style={{
                            padding: '4px 10px', background: '#e3f2fd', color: '#1565c0',
                            border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer', marginRight: 6
                          }}>수정</button>
                          <button onClick={() => handleLocalDelete(biz.id)} style={{
                            padding: '4px 10px', background: '#ffebee', color: '#c62828',
                            border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer'
                          }}>삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === 'stats' && (
          <div style={{
            background: '#fff', borderRadius: 10, padding: 32,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>게시글 통계</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {Object.entries(CATEGORIES).filter(([k]) => k).map(([cat, label]) => {
                const count = posts.filter(p => p.category === cat).length
                return (
                  <div key={cat} style={{
                    background: '#f9f9f9', borderRadius: 8, padding: '16px 20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#145A46' }}>{count}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {viewPost && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setViewPost(null)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 700,
            maxHeight: '80vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                  fontSize: 12, fontWeight: 600, background: '#e8f5e9', color: '#145A46', marginBottom: 8
                }}>{CATEGORIES[viewPost.category] || viewPost.category}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 0', color: '#1a1a1a' }}>{viewPost.title}</h2>
              </div>
              <button onClick={() => setViewPost(null)} style={{
                background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999'
              }}>x</button>
            </div>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              작성자: {viewPost.authorId} | 조회 {viewPost.viewCount} | 댓글 {viewPost.commentCount} | {formatDate(viewPost.createdAt)}
            </div>
            <div style={{
              whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#333', fontSize: 15,
              background: '#f9f9f9', borderRadius: 8, padding: 20
            }}>
              {viewPost.content}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { openEdit(viewPost); setViewPost(null) }} style={{
                padding: '8px 20px', background: '#145A46', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>수정</button>
              <button onClick={() => { setDeleteTarget(viewPost); setViewPost(null) }} style={{
                padding: '8px 20px', background: '#c62828', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editPost && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 700,
            maxHeight: '80vh', overflow: 'auto'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>게시글 수정</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>카테고리</label>
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{
                width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14
              }}>
                {Object.entries(CATEGORIES).filter(([k]) => k).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>상태</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{
                width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14
              }}>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>제목</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{
                width: '100%', padding: '8px 14px', border: '1px solid #ddd', borderRadius: 6,
                fontSize: 14, boxSizing: 'border-box'
              }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>내용</label>
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={12} style={{
                width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
                fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box'
              }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditPost(null)} style={{
                padding: '8px 20px', background: '#eee', color: '#333',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>취소</button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '8px 24px', background: '#145A46', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600
              }}>{saving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, width: 400, textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>게시글을 삭제하시겠습니까?</h3>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              &quot;{deleteTarget.title.substring(0, 30)}{deleteTarget.title.length > 30 ? '...' : ''}&quot;
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                padding: '8px 24px', background: '#eee', color: '#333',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>취소</button>
              <button onClick={handleDelete} style={{
                padding: '8px 24px', background: '#c62828', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
