import pgutil from '../utils/postgres'

export type AssignedCategories = {
  category_name: string
  group_id: number
}

export default {
  async getAllAssignedCategories(): Promise<AssignedCategories[]> {
    return await pgutil.select(`SELECT * FROM assigned_categories`)
  },
  async getAllCategories(): Promise<AssignedCategories[]> {
    return await pgutil.select(`SELECT DISTINCT task_category FROM datasheet`)
  },
  async setAssignedCategories(assignedCategories: AssignedCategories[]): Promise<void> {
    await pgutil.delete(`DELETE FROM assigned_categories`)
    for(let i of assignedCategories) {
      await pgutil.insert(`INSERT INTO assigned_categories (category_name, group_id) VALUES ('${i.category_name}', ${i.group_id})`)
    }
  }
}
