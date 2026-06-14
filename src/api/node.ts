import http from '@/utils/http';

export interface ThorNode {
  id: number;
  nodeName: string;
  ipAddress: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: string;
}

export const getNodeList = () => {
  return http.get<ThorNode[]>('/node/list');
};