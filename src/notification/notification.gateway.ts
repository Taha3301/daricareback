import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('NotificationGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinSpeciality')
    handleJoinSpeciality(
        @ConnectedSocket() client: Socket,
        @MessageBody() speciality: string,
    ) {
        const room = `speciality:${speciality}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room: ${room}`);
        return { event: 'joined', data: room };
    }

    sendToSpeciality(speciality: string, notification: any) {
        const room = `speciality:${speciality}`;
        this.server.to(room).emit('newBookingRequest', notification);
        this.logger.log(`Notification sent to room: ${room}`);
    }
}
