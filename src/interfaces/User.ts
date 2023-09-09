interface User {
  id: string;
  name: string | null;
  email: string;
  password: string;
  created_at: Date;
}


export const validateUser = (user: User): string[] => {

  if (!user.name) {
    return ["name is required"]
  }

  if (!user.email) {
    return ["email is required"]
  }

  if (!user.password) {
    return ["password is required"]
  }

  if (user.password.length < 7) {
    return ["password must be at least 6 characters"]
  }

  if (user.name.length < 3) {
    return ["name must be at least 3 characters"]
  }



  return [];

}




export default User;
