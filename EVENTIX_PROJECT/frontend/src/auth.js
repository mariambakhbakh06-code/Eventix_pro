export const ADMIN_EMAILS = [
    "naoufal.dahbi@gmail.com",
    "mariambakhbakh06@gmail.com",
    "admin@admin.com"
];

export const getUserRole = (user) => {
    const email = String(user?.email || "").trim().toLowerCase();

    if (ADMIN_EMAILS.includes(email)) {
        return "admin";
    }

    return user?.role || "customer";
};

export const getCurrentUser = () => {
    try {
        const user = JSON.parse(localStorage.getItem("contactPerson") || "null");

        if (!user) return null;

        return {
            ...user,
            role: getUserRole(user)
        };
    } catch {
        return null;
    }
};
