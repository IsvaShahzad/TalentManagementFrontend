import React, { useEffect, useState } from "react";
import { CIcon } from "@coreui/icons-react";
import { cilBell } from "@coreui/icons";
import { fetchNotificationsCount, markAllNotificationsAsRead } from "../../../api/api";
function NotificationBell({ userId }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const getCount = async () => {
            try {
                const data = await fetchNotificationsCount(userId);
                setCount(data); // ✅ Update state
            } catch (err) {
                console.error("Failed to fetch notifications count:", err);
            }
        };

        getCount(); // Initial fetch

        // Refresh every 30 seconds
        const interval = setInterval(getCount, 30000);

        return () => clearInterval(interval); // Cleanup
    }, [userId]);


    const handleBellClick = async () => {
        try {
            await markAllNotificationsAsRead(userId);
            setCount(0); // reset and hide badge
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
        }
    };

    return (
        <div className="relative cursor-pointer"
            onClick={handleBellClick}
        >
            <CIcon icon={cilBell} size="xl" />
            {count > 0 && (
                <span
                    style={{
                        position: "absolute",
                        top: "-1.4px",
                        right: "-4px",
                        backgroundColor: "red",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: "0.64rem",
                        fontWeight: "bold",
                        minWidth: "12px",
                        textAlign: "center",
                    }}
                >
                    {count}
                </span>
            )}
        </div>
    );
}

export default NotificationBell;
