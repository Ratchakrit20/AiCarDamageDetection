"use client";

import { useEffect, useState } from "react";
import { faEnvelope, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";

interface ExtendedUser {
  _id: string;
  id: string;
  username: string;
  firstName: string;
  role: string;
}

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  linkTo?: string;
  createdAt: string;
}

export default function NotificationBar() {
  const { data: session } = useSession() as {
    data: { user: ExtendedUser } | null;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    if (!session?.user?._id) return;
    try {
      const res = await fetch(`/api/notifications/getUserNotifications?userId=${session.user._id}`);
      const data = await res.json();
      setNotifications(data.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markOneAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/markOneAsRead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking one as read:", err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className="relative z-50">
      <button onClick={toggleDropdown} className="relative px-2 py-1.5 bg-[#230b55] rounded-full">
        <FontAwesomeIcon
          icon={isOpen ? faEnvelopeOpen : faEnvelope}
          className="text-white text-2xl"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white text-black shadow-xl rounded-lg z-50 p-4 max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Notification</h3>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mb-3">
            <button
              className={clsx("px-3 py-1 rounded-full text-sm font-semibold", {
                "bg-purple-600 text-white": filter === "all",
                "bg-gray-200": filter !== "all",
              })}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={clsx("px-3 py-1 rounded-full text-sm font-semibold", {
                "bg-purple-600 text-white": filter === "unread",
                "bg-gray-200": filter !== "unread",
              })}
              onClick={() => setFilter("unread")}
            >
              Unread
            </button>
          </div>

          <ul className="space-y-2">
            {filteredNotifications.length === 0 && (
              <p className="text-gray-500 text-sm">ไม่มีการแจ้งเตือน</p>
            )}
            {filteredNotifications.map((note) => (
              <li
                key={note._id}
                className={clsx("p-3 rounded-md transition", {
                  "bg-gray-200 ": !note.isRead,
                  "bg-gray-400 text-gray-600": note.isRead,
                })}
              >
                <Link
                  href={note.linkTo || "#"}
                  onClick={() => {
                    if (!note.isRead) markOneAsRead(note._id);
                  }}
                  className="block"
                >
                  <p className={clsx("text-sm", { "font-semibold": !note.isRead })}>
                    {note.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.createdAt).toLocaleString("th-TH")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
