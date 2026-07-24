type AdminDatabase = {
  table: (name: string) => object
}

const contentNavigation = 'Content'

const readOnlyVisible = {
  list: true,
  filter: true,
  show: true,
  edit: false,
}

const sharedTimestamps = {
  created_at: {
    isVisible: readOnlyVisible,
  },
  updated_at: {
    isVisible: readOnlyVisible,
  },
}

export function createAdminResources(db: AdminDatabase) {
  return [
    {
      resource: db.table('users'),
      options: {
        navigation: contentNavigation,
        actions: {
          new: {
            isAccessible: false,
          },
          edit: {
            isAccessible: false,
          },
          delete: {
            isAccessible: false,
          },
        },
        properties: {
          password_hash: {
            isVisible: false,
          },
          ...sharedTimestamps,
        },
      },
    },
    {
      resource: db.table('questions'),
      options: {
        navigation: contentNavigation,
        actions: {
          new: {
            isAccessible: false,
          },
        },
        properties: {
          author_id: {
            isVisible: readOnlyVisible,
          },
          title: {
            type: 'string',
          },
          question_text: {
            type: 'textarea',
          },
          ...sharedTimestamps,
        },
      },
    },
    {
      resource: db.table('answers'),
      options: {
        navigation: contentNavigation,
        actions: {
          new: {
            isAccessible: false,
          },
        },
        properties: {
          question_id: {
            isVisible: readOnlyVisible,
          },
          author_id: {
            isVisible: readOnlyVisible,
          },
          answer_text: {
            type: 'textarea',
          },
          is_best: {
            isVisible: {
              list: true,
              filter: true,
              show: true,
              edit: true,
            },
          },
          ...sharedTimestamps,
        },
      },
    },
  ]
}
