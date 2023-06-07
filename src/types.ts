export type TUserDB = {
    id: string,
    name: string,
    email: string,
    password: string
}

export type TTaskDB = {
    id: string,
    title: string,
    description: string,
    created_at: string,
    status: number
}

export type TUserTaskDB = {
    user_id: string,
    task_id: string
}

export type TTaskWithUsers = {
    id: string,
    title: string,
    description: string,
    created_at: string,
    status: number,
    responsibles: TUserDB[]
}