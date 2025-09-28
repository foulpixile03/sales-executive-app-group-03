const handleChatbotRedirect = (call) => {
    if (!call) {
        console.error('No call selected');
        return;
    }

    // Debug log to see what properties are available
    console.log('Call object:', call);

    // Try to get orderId from potential properties
    const orderId = call.orderId || call.order?.id || call.id;

    if (!orderId) {
        console.error('No order ID found in call object:', call);
        return;
    }

    console.log('Navigating to chat with ID:', orderId);
    navigate(`/chat/${orderId}`);
};