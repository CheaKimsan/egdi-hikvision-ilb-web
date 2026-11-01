const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

export { formatDate, formatTime };