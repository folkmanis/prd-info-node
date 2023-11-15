import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import chokidar, { FSWatcher } from 'chokidar';
import { MessagesService, JobMessage, FsOperations } from '../messages';
import { AppConfig } from '../dot-env.config';

@Injectable()
export class FtpWatcherService implements OnApplicationBootstrap {
  private readonly logger = new Logger('FtpWatcher');

  protected readonly ftpPath = this.configService.get('FTP_FOLDER');

  private watcher: FSWatcher | undefined;

  constructor(
    private msgService: MessagesService,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  onApplicationBootstrap() {
    this.start();
  }

  start() {
    if (this.watcher) {
      return;
    }

    this.watcher = this.ftpWatcher();

    this.watcher
      .on('add', this.callbackFn('add'))
      .on('addDir', this.callbackFn('addDir'))
      .on('change', this.callbackFn('change'))
      .on('unlink', this.callbackFn('unlink'))
      .on('ready', () => this.logger.log('ftp watch ready', this.ftpPath));
  }

  stop() {
    this.watcher?.close();
    this.watcher = undefined;
  }

  private ftpWatcher(): FSWatcher {
    return chokidar.watch(this.ftpPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      awaitWriteFinish: {
        stabilityThreshold: 3000,
        pollInterval: 500,
      },
    });
  }

  private callbackFn(operation: FsOperations) {
    const offset = this.ftpPath.length + 1;
    return (path: string) => {
      this.msgService.add(
        new JobMessage({
          action: 'ftpUpload',
          operation,
          path: path?.slice(offset).split('/'),
        }),
      );
    };
  }
}
