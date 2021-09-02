import { Module, Global, FactoryProvider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';

const connectionFactory: FactoryProvider<Promise<MongoClient>> = {
    provide: 'MONGO_CLIENT',
    useFactory: async (conf: ConfigService) => MongoClient.connect(
        conf.get('DB_SRV')!,
        {
            poolSize: 50,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            connectTimeoutMS: 5000,
            writeConcern: {
                wtimeout: 2500,
            }
        },
    ),
    inject: [ConfigService],
};


@Global()
@Module({
    providers: [
        connectionFactory,
    ],
    exports: [
        'MONGO_CLIENT',
    ]
})
export class DatabaseModule { }
