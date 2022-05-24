import { injectable } from 'inversify';
import fs = require('fs');
import util = require('util');
import { Dirent } from 'fs';
import { Path } from '@theia/core/lib/common/path';
import { CancellationToken } from '@theia/core';
import { BackendFileService } from '../common/backend-file-service';
import { BackendApplicationContribution, FileUri } from '@theia/core/lib/node';
import { Application } from '@theia/core/shared/express';
// import { CsvFormatterStream, Row } from '@fast-csv/format'

@injectable()
export class BackendFileServiceImpl implements BackendFileService, BackendApplicationContribution {

    // @ts-ignore
    private fileStream: fs.WriteStream;
    // private stream: CsvFormatterStream<Row, Row>;
    private appendFile = util.promisify(fs.appendFile);

    async findTraces(path: string, cancellationToken: CancellationToken): Promise<string[]> {
        /*
        * On Windows, Theia returns a path that starts with "/" (e.g "/c:/"), causing fsPromise.stat
        * to fail. FileUri.fsPath returns the platform specific path of the orginal Theia path
        * that fixes this issue.
        */
        const cleanedPath = FileUri.fsPath(path);

        const traces: string[] = [];
        const stats = await fs.promises.stat(cleanedPath);
        if (stats.isDirectory()) {
            await this.deepFindTraces(cleanedPath, traces, cancellationToken);
        } else if (stats.isFile()) {
            traces.push(cleanedPath);
        }
        if (cancellationToken.isCancellationRequested) {
            return [];
        }
        return traces;
    }

    /**
     * Find traces recursively in the specified folder path, adding the path of
     * found traces to the specified traces array.
     *
     * This implementation only finds CTF traces.
     *
     * @param path current folder path
     * @param traces array of found traces paths
     * @param cancellationToken cancellation token
     * @returns an empty promise
     */
    private async deepFindTraces(path: string, traces: string[], cancellationToken: CancellationToken): Promise<void> {
        const childDirs: Dirent[] = [];
        for await (const dirent of await fs.promises.opendir(path)) {
            if (cancellationToken.isCancellationRequested) {
                return;
            }
            if (dirent.isDirectory()) {
                childDirs.push(dirent);
            } else if (dirent.name === 'metadata') {
                /* This dir is a CTF trace, ignore all child dirs */
                traces.push(path);
                return;
            }
        }
        /* This dir was not a trace, recurse through its child dirs */
        const parent = new Path(path);
        for (const dirent of childDirs) {
            if (cancellationToken.isCancellationRequested) {
                return;
            }
            const childPath = parent.join(dirent.name);
            await this.deepFindTraces(childPath.toString(), traces, cancellationToken);
        }
    }

    // createFile(fileName: string): void {
    //     this.fileStream = fs.createWriteStream(fileName, {flags: 'a+'});
    // }

    // async writeToFile(data: string): Promise<void> {
    //     if (!this.fileStream.write(data)) {
    //         return new Promise((resolve, reject) => {
    //             this.fileStream.once('drain', () => {resolve})
    //             // Will pause every until `drain` is emitted
    //             // await new Promise(resolve => file.once('drain', resolve));
    //         });
    //     } else {
    //         return Promise.resolve();
    //     }
    // }

    async fileOperation(payload: { fileName: string, flag: string, data?: string, path?: string }): Promise<void> {
        // Attempt #2
        
        if (payload.flag === 'create') {
            // Attempt #1
            this.fileStream = fs.createWriteStream(payload.fileName);
            
            // Attempt #3
            // this.stream = format();
            // this.stream.pipe(this.fileStream);
        } else if (payload.flag === 'append' && payload.data !== undefined) {
            // Attempt #1
            // if (!this.fileStream.write(payload.data)) {
            //         // this.fileStream.once('drain', () => {resolve})
            //         // Will pause every until `drain` is emitted
            //         await new Promise(resolve => this.fileStream.once('drain', resolve));
            // }
            this.fileStream.write(payload.data)

            // Attempt #2
            // console.log('append file called');
            // Asynchronously append data to a file, creating the file if it does not exist
            await this.appendFile(payload.fileName, payload.data);

            // Attempt #3
            // this.stream.write(payload.data);
        } else if (payload.flag === 'close') {
            // this.fileStream.end();

            //Attempt #3
            // this.stream.end();
        } else if (payload.flag === 'delete') {
            fs.unlink(payload.fileName, (err) => {
                console.log(err);
            })
        }
    }

    configure(app: Application): void {
        app.get('/trace-viewer/download/csv/:fileName', async (req, res) => {
            const { fileName } = req.params;
            // Access to __dirname
            res.download(fileName as string, (err) => {
                if (err) {
                    res.send({
                        eror: err,
                        msg: "Problem downloading the file"
                    })
                }
            });
            // fs.unlinkSync(fileName);
            // fs.unlink(fileName, (err) => {
            //     console.log(err);
            // });
        });
    }
}
