import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('[SupabaseClient] Initializing with Url:', supabaseUrl, 'AnonKey starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined');

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Offline Local Mock Fallback client ---
const mockAuth = {
  getSession: async () => {
    const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('aerolearn_mock_session') : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    return { data: { session }, error: null };
  },
  getUser: async () => {
    const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('aerolearn_mock_session') : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    return { data: { user: session?.user || null }, error: null };
  },
  signInWithPassword: async ({ email, password }) => {
    const mockUser = {
      id: 'mock-user-123',
      email: email,
      user_metadata: { full_name: 'Explorer Mode' }
    };
    const mockSession = {
      access_token: 'mock-token-xyz',
      user: mockUser
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerolearn_mock_session', JSON.stringify(mockSession));
      // Initialize mock profile
      const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
      if (!profiles[mockUser.id]) {
        profiles[mockUser.id] = {
          id: mockUser.id,
          display_name: 'Explorer',
          preferred_languages: ['en'],
          disabilities: ['none'],
          dyslexia_friendly: false,
          high_contrast: false,
          sign_language_preference: false,
          avatar_url: null,
          bio: 'Default space explorer bio',
          reading_level_override: 'default',
          preferred_voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
          narration_speed: 1.0,
          low_stimulus_mode: false,
          text_size_scale: 1.0,
          knowledge_hive_visibility: 'matched_groups',
          goals: []
        };
        localStorage.setItem('aerolearn_mock_profiles', JSON.stringify(profiles));
      }
    }
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  signUp: async ({ email, password, options }) => {
    const fullName = options?.data?.full_name || 'Explorer';
    const mockUser = {
      id: 'mock-user-123',
      email: email,
      user_metadata: { full_name: fullName }
    };
    const mockSession = {
      access_token: 'mock-token-xyz',
      user: mockUser
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerolearn_mock_session', JSON.stringify(mockSession));
      const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
      if (!profiles[mockUser.id]) {
        profiles[mockUser.id] = {
          id: mockUser.id,
          display_name: fullName,
          preferred_languages: [],
          disabilities: [],
          dyslexia_friendly: false,
          high_contrast: false,
          sign_language_preference: false,
          avatar_url: null,
          bio: '',
          reading_level_override: 'default',
          preferred_voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
          narration_speed: 1.0,
          low_stimulus_mode: false,
          text_size_scale: 1.0,
          knowledge_hive_visibility: 'matched_groups',
          goals: []
        };
        localStorage.setItem('aerolearn_mock_profiles', JSON.stringify(profiles));
      }
    }
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aerolearn_mock_session');
    }
    return { error: null };
  },
  onAuthStateChange: (callback) => {
    const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('aerolearn_mock_session') : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    callback('SIGNED_IN', session);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

const mockFrom = (table) => {
  return {
    select: (selectStr = '*') => {
      return {
        eq: (col, val) => {
          return {
            single: async () => {
              if (table === 'profiles') {
                const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
                const profile = profiles[val] || Object.values(profiles)[0] || null;
                return { data: profile, error: profile ? null : new Error('Profile not found') };
              }
              if (table === 'documents') {
                const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
                const doc = docs.find(d => d[col] === val) || null;
                return { data: doc, error: doc ? null : new Error('Document not found') };
              }
              if (table === 'profile_stats') {
                const stats = JSON.parse(localStorage.getItem('aerolearn_mock_stats') || '{}');
                const userStats = stats[val] || {
                  user_id: val,
                  documents_processed: 3,
                  topics_completed: 12,
                  notes_shared: 2,
                  notes_helped_count: 5,
                  languages_used: ['en', 'es'],
                  current_streak_days: 3,
                  longest_streak_days: 7,
                  last_active_date: new Date().toISOString().split('T')[0]
                };
                return { data: userStats, error: null };
              }
              if (table === 'profile_privacy_settings') {
                const privacy = JSON.parse(localStorage.getItem('aerolearn_mock_privacy') || '{}');
                const userPrivacy = privacy[val] || {
                  user_id: val,
                  show_display_name_in_hive: true,
                  show_stats_publicly: true,
                  allow_peer_note_requests: true
                };
                return { data: userPrivacy, error: null };
              }
              return { data: null, error: new Error('Not found') };
            },
            eq: (col2, val2) => {
              return {
                order: (orderCol, { ascending } = {}) => {
                  return {
                    then: async (resolve) => {
                      if (table === 'documents') {
                        const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
                        const filtered = docs.filter(d => d[col] === val && d[col2] === val2);
                        resolve({ data: filtered, error: null });
                      } else {
                        resolve({ data: [], error: null });
                      }
                    }
                  };
                }
              };
            },
            order: (orderCol, { ascending } = {}) => {
              const chain = {
                then: async (resolve) => {
                  if (table === 'topics') {
                    const topics = JSON.parse(localStorage.getItem('aerolearn_mock_topics') || '[]');
                    const filtered = topics.filter(t => t[col] === val);
                    filtered.sort((a, b) => ascending ? a[orderCol] - b[orderCol] : b[orderCol] - a[orderCol]);
                    resolve({ data: filtered, error: null });
                  } else if (table === 'documents') {
                    const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
                    const filtered = docs.filter(d => d[col] === val);
                    resolve({ data: filtered, error: null });
                  } else if (table === 'linked_devices') {
                    let devices = JSON.parse(localStorage.getItem('aerolearn_mock_devices') || '[]');
                    if (devices.length === 0) {
                      devices = [
                        { id: 'dev-1', user_id: val, device_label: 'Chrome on Windows', is_current: true, last_active: new Date().toISOString() },
                        { id: 'dev-2', user_id: val, device_label: 'Safari on iOS', is_current: false, last_active: new Date(Date.now() - 86400000).toISOString() }
                      ];
                      localStorage.setItem('aerolearn_mock_devices', JSON.stringify(devices));
                    }
                    resolve({ data: devices, error: null });
                  } else {
                    resolve({ data: [], error: null });
                  }
                }
              };
              return chain;
            }
          };
        },
        order: (orderCol, { ascending } = {}) => {
          return {
            then: async (resolve) => {
              if (table === 'knowledge_hive_notes') {
                const notes = JSON.parse(localStorage.getItem('aerolearn_mock_notes') || '[]');
                resolve({ data: notes, error: null });
              } else if (table === 'documents') {
                const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
                resolve({ data: docs, error: null });
              } else {
                resolve({ data: [], error: null });
              }
            }
          };
        }
      };
    },
    upsert: async (payload) => {
      if (table === 'profiles') {
        const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
        const existing = profiles[payload.id] || {};
        profiles[payload.id] = { ...existing, ...payload };
        localStorage.setItem('aerolearn_mock_profiles', JSON.stringify(profiles));
        return { data: profiles[payload.id], error: null };
      }
      if (table === 'profile_stats') {
        const stats = JSON.parse(localStorage.getItem('aerolearn_mock_stats') || '{}');
        const existing = stats[payload.user_id] || {};
        stats[payload.user_id] = { ...existing, ...payload };
        localStorage.setItem('aerolearn_mock_stats', JSON.stringify(stats));
        return { data: stats[payload.user_id], error: null };
      }
      if (table === 'profile_privacy_settings') {
        const privacy = JSON.parse(localStorage.getItem('aerolearn_mock_privacy') || '{}');
        const existing = privacy[payload.user_id] || {};
        privacy[payload.user_id] = { ...existing, ...payload };
        localStorage.setItem('aerolearn_mock_privacy', JSON.stringify(privacy));
        return { data: privacy[payload.user_id], error: null };
      }
      return { data: null, error: null };
    },
    update: (payload) => {
      return {
        eq: (col, val) => {
          return {
            then: async (resolve) => {
              if (table === 'knowledge_hive_notes') {
                const notes = JSON.parse(localStorage.getItem('aerolearn_mock_notes') || '[]');
                const idx = notes.findIndex(n => n[col] === val);
                if (idx !== -1) {
                  notes[idx] = { ...notes[idx], ...payload };
                  localStorage.setItem('aerolearn_mock_notes', JSON.stringify(notes));
                }
                resolve({ data: notes[idx] || null, error: null });
              } else if (table === 'profiles') {
                const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
                if (profiles[val]) {
                  profiles[val] = { ...profiles[val], ...payload };
                  localStorage.setItem('aerolearn_mock_profiles', JSON.stringify(profiles));
                }
                resolve({ data: profiles[val] || null, error: null });
              } else if (table === 'profile_privacy_settings') {
                const privacy = JSON.parse(localStorage.getItem('aerolearn_mock_privacy') || '{}');
                if (privacy[val]) {
                  privacy[val] = { ...privacy[val], ...payload };
                  localStorage.setItem('aerolearn_mock_privacy', JSON.stringify(privacy));
                }
                resolve({ data: privacy[val] || null, error: null });
              } else {
                resolve({ data: null, error: null });
              }
            }
          };
        }
      };
    },
    delete: () => {
      return {
        eq: (col, val) => {
          const chain = {
            eq: (col2, val2) => {
              return {
                then: async (resolve) => {
                  if (table === 'linked_devices') {
                    let devices = JSON.parse(localStorage.getItem('aerolearn_mock_devices') || '[]');
                    devices = devices.filter(d => !(d[col] === val && d[col2] === val2));
                    localStorage.setItem('aerolearn_mock_devices', JSON.stringify(devices));
                  }
                  resolve({ error: null });
                }
              };
            },
            then: async (resolve) => {
              if (table === 'linked_devices') {
                let devices = JSON.parse(localStorage.getItem('aerolearn_mock_devices') || '[]');
                devices = devices.filter(d => d[col] !== val);
                localStorage.setItem('aerolearn_mock_devices', JSON.stringify(devices));
              } else if (table === 'profiles') {
                const profiles = JSON.parse(localStorage.getItem('aerolearn_mock_profiles') || '{}');
                delete profiles[val];
                localStorage.setItem('aerolearn_mock_profiles', JSON.stringify(profiles));
              }
              resolve({ error: null });
            }
          };
          return chain;
        }
      };
    },
    insert: (payload) => {
      const chain = {
        select: () => {
          return {
            single: async () => {
              if (table === 'documents') {
                const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
                const newDoc = { id: 'mock-doc-' + Date.now(), ...payload, status: 'ready' };
                docs.push(newDoc);
                localStorage.setItem('aerolearn_mock_documents', JSON.stringify(docs));
                
                // Initialize default mock topics for the document
                const mockTopics = [
                  {
                    id: 'mock-topic-' + Date.now() + '-1',
                    document_id: newDoc.id,
                    order_index: 0,
                    title: 'Introduction to STEM Workspace',
                    explanation: 'Welcome to your adaptive cockpit. In mock mode, documents are parsed and displayed with locally-simulated accessibility channels. You can use reading ruler alignments or test cognitive layout levels.',
                    sign_video_url: null
                  },
                  {
                    id: 'mock-topic-' + Date.now() + '-2',
                    document_id: newDoc.id,
                    order_index: 1,
                    title: 'Adaptive Learning Modules',
                    explanation: 'AeroLearn translates and restructures scientific texts with LaTeX support ($e = mc^2$) dynamically. You can test comprehension checks, narration settings, or translation modes.',
                    sign_video_url: null
                  }
                ];
                const allTopics = JSON.parse(localStorage.getItem('aerolearn_mock_topics') || '[]');
                localStorage.setItem('aerolearn_mock_topics', JSON.stringify([...allTopics, ...mockTopics]));

                return { data: newDoc, error: null };
              }
              return { data: null, error: null };
            }
          };
        },
        then: async (resolve) => {
          if (table === 'knowledge_hive_notes') {
            const notes = JSON.parse(localStorage.getItem('aerolearn_mock_notes') || '[]');
            const docs = JSON.parse(localStorage.getItem('aerolearn_mock_documents') || '[]');
            const doc = docs.find(d => d.id === payload.document_id) || {};
            const newNote = {
              id: 'mock-note-' + Date.now(),
              upvotes: payload.upvotes || 0,
              created_at: new Date().toISOString(),
              documents: {
                id: doc.id || 'mock-doc-123',
                title: doc.title || 'STEM Lecture Notes',
                target_lang: doc.target_lang || 'English',
                source_type: doc.source_type || 'upload'
              },
              profiles: {
                display_name: 'Explorer Pilot'
              }
            };
            notes.push(newNote);
            localStorage.setItem('aerolearn_mock_notes', JSON.stringify(notes));
            resolve({ data: newNote, error: null });
          } else if (table === 'reports') {
            resolve({ data: payload, error: null });
          } else {
            resolve({ data: null, error: null });
          }
        }
      };
      return chain;
    }
  };
};

const mockSupabase = {
  auth: mockAuth,
  from: mockFrom
};

export const supabase = new Proxy({}, {
  get(target, prop) {
    if (typeof window === 'undefined') {
      return realSupabase[prop];
    }
    const useMock = localStorage.getItem('aerolearn_use_mock') === 'true' || window.__use_mock_supabase === true;
    const client = useMock ? mockSupabase : realSupabase;
    return client[prop];
  }
});