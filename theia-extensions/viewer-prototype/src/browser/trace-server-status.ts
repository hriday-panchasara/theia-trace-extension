/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { inject, injectable } from 'inversify';
import { TspClient } from 'tsp-typescript-client/lib/protocol/tsp-client';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { TspClientResponse } from 'tsp-typescript-client/lib/protocol/tsp-client-response';
import { HealthStatus } from 'tsp-typescript-client/lib/models/health';
import { TspClientProvider } from './tsp-client-provider-impl';

@injectable()
export class TraceServerConnectionStatusService {

    private lastPing = new Deferred();
    private tspClient: TspClient;
    private timeoutFunc: NodeJS.Timeout;
    private timeoutDuration = 5000;

    private constructor(
        @inject(TspClientProvider) private tspClientProvider: TspClientProvider
    ) {
        this.tspClient = this.tspClientProvider.getTspClient();
        this.tspClientProvider.addTspClientChangeListener(tspClient => this.tspClient = tspClient);
    }

    public schedulePing(): void {
        const ping = async () => {
            this.lastPing.reject();
            this.lastPing = new Deferred();
            try {
                const healthResponse = await Promise.race([this.tspClient.checkHealth(), this.lastPing.promise]);
                if ((healthResponse as TspClientResponse<HealthStatus>).getModel()?.status === 'UP') {
                    this.renderSuccess();
                } else {
                    this.renderFailure();
                }
            } catch (e) {
                this.renderFailure();
            }
        };

        ping();
        this.timeoutFunc = setInterval(ping, this.timeoutDuration);
    }

    public clearPing(): void {
        clearInterval(this.timeoutFunc);
        this.lastPing.resolve();
    }

    private renderSuccess(): void {
        if (document.getElementById('trace.viewer.serverCheck')) {
            document.getElementById('trace.viewer.serverCheck')!.className = 'fa fa-check-circle-o fa-lg';
            document.getElementById('trace.viewer.serverCheck')!.title = 'Server health and latency are good. No known issues';
            document.getElementById('trace.viewer.serverCheck')!.style.color = 'green';
        }
    }

    private renderFailure(): void {
        if (document.getElementById('trace.viewer.serverCheck')) {
            document.getElementById('trace.viewer.serverCheck')!.className = 'fa fa-times-circle-o fa-lg';
            document.getElementById('trace.viewer.serverCheck')!.title = 'Trace Viewer Critical Error: Trace Server Offline';
            document.getElementById('trace.viewer.serverCheck')!.style.color = 'red';
        }
    }
}
