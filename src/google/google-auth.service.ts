import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreferencesService, SystemSystemPreference } from '../preferences';
import { readFile } from 'fs/promises';
import { plainToClass, Expose, Type } from 'class-transformer';
import { IsString, IsUrl, IsDataURI, ValidateNested, Equals } from 'class-validator';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleConfig } from './google-config.interface';



@Injectable()
export class GoogleAuthService {

    constructor(
        private configService: ConfigService,
        private preferences: PreferencesService,
    ) { }

    async auth(eMail: string) {

        const { credentialsLocation, scope } = this.configService.get('google') as GoogleConfig;

        const authClient = new google.auth.JWT({
            scopes: [scope],
            subject: eMail,
            // keyFile: credentialsLocation,
            email: "prd-info@prd-info.iam.gserviceaccount.com",
            keyId: "d5077ff9298710c1ea82c36c7bcbdc47759d615f",
            key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCtwfOeExLt8hd0\n91+aPy0kX08ez4t8/AEOGaDCFGsAeCWhmFaklUy6fQyitIIPOa1CpT3HqQtVozDP\ngwLfuDe11RVwF7ko2bSGSUjKH+xecN39q8JSWVSUwsIFvXpFyyHU8jTnw5syuGAJ\nAf4NtzxlLGxjl3qonvECZBgtmWWpEDXEnIUKg5l1CfmWNCuOYINAPF+0tFeFd5rq\nIuoVWtpbMTKGtd5adu2usLJUcVQ9vyTT7k9a8xgfRdjuZA78oc0D9ryS1aURQ75B\n/A1rX1XqpBPwaJIUaub3JO0NOOAAk+cfMnMwRLe2ftqDNWMnHx2YdQ2gG4wSpEkv\nb9x0r8ZLAgMBAAECggEARO9UKAwYL/eib8CumKLk1W/Mk4QyqljOUFpBiY4RL4P7\nJgOqqCwlXz06VJi5mrG+t9iXzI0X1pdiR4mKC9jpnUWW9jwrNPY+JSKQ8sO8gnFT\n2Q6aDxKquEQWNrHH/0WKPBIFhEd53KMCUsCMGsPt/ZOkwtQ3kQtRwamVYA3iI7KG\n16h07C/C+4w+xtAzYY4kgPHaZh5EOE58QDqx6iIW9aX4v43XL39owU3zXWbYwgq5\nSUSwf0ZC0Fz5QdSbb5ehXCjja4vj+YzzKWkdWUVb8W5N53xSJ4Mg3D8xO1uQrU9Y\nNj7laavB2Ju1CZI4U0wN6EluLQYSMpsxirgKUOEhiQKBgQDq7Ca7cGGP/70GQaw5\nBv79f8hHNIHsVtSdyHB71ujSqbD6hqB3FWBPyNQTj/zUX5KInfR8ArBOnctvf6b0\nCqEaKoN9Gwh9QvyvE+45eRBJnaqm2ldpv3ZPHIX/pkWBmY7RFxkN7RjbatHNH+8V\n8d++hXvOyH9jv0Z1GE+akStMyQKBgQC9WO1j/ELNeny3CvPO2XYrO2bGkV8hfAJY\nrWMcMbv3qChfw1QFeLRzNWfC/f4oxYUoGjXjZOA+MGdWyonz7cDoN3O8COsCHG+C\nZNHI4Dg+INUZ3sPTck7zavKGVEUazR9Pga5X/8xz9ZFMzYtkSWnLrny/oL2tCaQZ\nAMtnjiYIcwKBgAOIzgRf6nfaJyPi9Q5elpOFyqOXnKTLoaNGErsqPpJ8zxbV07A2\n+B37LYWl0u33CiNYDQeYmsJ0CU2CJCbjygy0uwm00GniCh8wM5NVyPLyllCwVERZ\nBxSlnzZ7b+xFPSrUKCJXgNo8Py/Q3S39V5psM7KmvZPomszEMt5mdLpRAoGAV/jm\nKqs8ml1LbnvvNO7CQWnS4XUPPu5v5KWCQ8ozq+f8AiotcnFXXaO1dtotaOIEcNJk\nsSbgLOSuTpvBpoyTMRD6e6WlEpEFmg6fjXXni64TdHaUgzw7xEqvLYwfo0kkP/tf\ndlFJu6KfhJCHL+wP9Gs4WIwlNC0jid5dotpff1MCgYBXnpQKBD03Nvmcfux5mya1\n2wG9ZjQf0iNYr0lZ3uVavzNyuyBVJHOCzyZ2UD5gvZVLJQf0HJ/LARxR9JfXrAmS\nqMxVp0M+A63fRolEmGFXaeujp3yFbKTxAgo7/BpNOdVcPPLVwMB3adEAuoI14il3\nZqGY8tRLwkZ3PkTzcxzrXw==\n-----END PRIVATE KEY-----\n",
        });

        return authClient;

    }

}
