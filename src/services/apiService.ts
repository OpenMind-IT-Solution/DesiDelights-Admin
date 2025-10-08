import { getSession, signOut } from 'next-auth/react'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const handleResponse = async (response: Response) => {
  // if (!response.ok) {
  //   console.log(response);

  //   if (response.status === 401) {
  //     // Unauthorized, log out and redirect to login page
  //     await signOut({ redirect: true, callbackUrl: "/login" });
  //     throw new Error("Unauthorized. Token missing or expired");
  //   } else if (response.status === 422) {
  //     // Unprocessable Entity, handle validation errors
  //     const errorResponse = await response.json();
  //     const { message, data } = errorResponse;
  //     if (message === "validation error" && data) {
  //       const errors = Object.keys(data).map((key) => `${key}: ${data[key]}`);
  //       toast.error(errors.join("; "));
  //       throw new Error("Validation error1");
  //     } else {
  //       toast.error(message || "Validation error");
  //       throw new Error(message || "Validation error");
  //     }
  //   } else if (response.status === 400) {
  //     // Bad Request, handle validation errors
  //     const errorResponse = await response.json();
  //     const { Message, data } = errorResponse;
  //     if (Message === "validation error" && data && typeof data === "object") {
  //       const errors = Object.values(data).map((errorMessage) => errorMessage);
  //       toast.error(errors.join("; "));
  //       throw new Error("Validation error");
  //     } else {
  //       toast.error(Message || "Validation error");
  //       throw new Error(Message || "Validation error");
  //     }
  //   } else {
  //     // Other errors
  //     const error = await response.text();
  //     toast.error(error);
  //     throw new Error(error);
  //   }
  // }
  // return await response.json();

  if (!response.ok) {
    console.log(response)

    if (response.status === 401) {
      // Unauthorized, log out and redirect to login page
      await signOut({ redirect: true, callbackUrl: '/login' })
      throw new Error('Unauthorized. Token missing or expired')
    } else {
      const errorResponse = await response.json()
      const { Message } = errorResponse

      toast.error(Message)
      throw new Error(Message)
    }
  } else {
    const successResponse = await response.json()

    if (successResponse.ResponseStatus === 'failure') {
      toast.error(successResponse?.Message)
      throw new Error(successResponse?.Message)
    }

    
return successResponse
  }
}

export const fetchData = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const session = await getSession()

    if (!session || !session?.user) {
      throw new Error('No session or access token found')
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user.accessToken}`,
        ...options.headers
      }
    })

    
return await handleResponse(response)
  } catch (error: any) {
    console.error('Error fetching data:', error.message)

    // toast.error(error.message);
    throw error
  }
}

export const get = (endpoint: string) => fetchData(endpoint)

export const unauthorizedPost = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    
return await handleResponse(response)
  } catch (error: any) {
    console.error('Error fetching data:', error.message)
    throw error
  }
}

export const post = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const put = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })

export const del = (endpoint: string) =>
  fetchData(endpoint, {
    method: 'DELETE'
  })

export const postFormData = async (endpoint: string, formData: any) => {
  try {
    const session = await getSession()

    if (!session || !session?.user) {
      throw new Error('No session or access token found')
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`
      }
    })

    
return await handleResponse(response)
  } catch (error: any) {
    console.error('Error fetching data:', error)

    // toast.error(error.message);
    throw error
  }
}

// export const ExportData = async (
//   endpoint: string,
//   formData: any,
//   fileName: string
// ) => {
//   try {
//     const session = await getSession();

//     if (!session || !session?.user) {
//       throw new Error("No session or access token found");
//     }

//     const response = await fetch(`${API_URL}/${endpoint}`, {
//       method: "POST",
//       body: JSON.stringify(formData),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${session?.user.token}`,
//       },
//     });

//     console.log("🚀 ~ response:", response)
//     if (!response.ok) {
//       const errorText = await response.json().catch(() => null);
//       toast.error(errorText?.Message || "Export Failed");
//     } else {
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName;
//       document.body.appendChild(a);
//       a.click();

//       setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//       }, 100);

//       toast.success("Export completed successfully");
//     }
//   } catch (error: any) {
//     console.error("Error exporting data:", error);
//     throw error;
//   }
// };

export const ExportData = async (endpoint: string, formData: any, fileName: string) => {
  try {
    const session = await getSession()

    if (!session || !session?.user) {
      throw new Error('No session or access token found')
    }

    const response = await axios.post(`${API_URL}/${endpoint}`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`
      },
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)

    toast.success('Export completed successfully')
  } catch (error: any) {
    console.log('🚀 ~ error:', error.response)
    console.error('Error exporting data:', error)
    toast.error(error.response?.Message || 'No data available for export based on the selected criteria.')
    throw error
  }
}
