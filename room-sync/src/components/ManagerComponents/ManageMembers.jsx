import React from 'react'
import Member from './Member'
import { members } from '@/members'

const ManageMembers = () => {
  return (
      <div>
<h4 className='text-2xl text-center text-slate-800'>Manage members</h4>
    <div className='max-w-lg mx-auto p-6'>
      {members.map((user) => <Member key={user.id} user={user} />)}
    </div>
      </div>
  )
}

export default ManageMembers
