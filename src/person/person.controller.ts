import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { PersonService } from './person.service';
import { PersonRequest, SyncResponse } from './person.interface';
import { SeedService } from './seed.service';

@Controller()
export class PersonController {
constructor(private personService: PersonService, private seedService: SeedService) {}

@GrpcMethod('PersonService')
async savePerson(data: PersonRequest): Promise<any> {
    try {
        const savedPerson = await this.personService.savePerson(data);
        return {
            id: savedPerson.id,
            name: savedPerson.name,
            lastName: savedPerson.lastName,
            age: savedPerson.age,
            weight: savedPerson.weight,
            saved: true,
            message: 'Person saved successfully'
        };
    } catch (error) {
        return {
            saved: false,
            message: 'Failed to save person'
        };
    }
}

@GrpcStreamMethod('PersonService')
syncPeople(messages: Observable<PersonRequest>): Observable<SyncResponse> {
const people: PersonRequest[] = [];

return new Observable<SyncResponse>(observer => {
    messages.subscribe({
        next: (message: PersonRequest) => {
            console.log('Received person:', message);
            people.push(message);
        },
        error: (err) => {
            console.error('Stream error:', err);
            observer.error(err);
        },
        complete: async () => {
            try {
                console.log(`Processing ${people.length} people`);
                const syncedIds = await this.personService.syncPeople(people);
                
                const response: SyncResponse = {
                    success: true,
                    syncedIds: syncedIds,
                    message: 'Sync completed successfully'
                };

                console.log('Sending response:', response);
                observer.next(response);
                observer.complete();
            } catch (error) {
                console.error('Error processing sync:', error);
                observer.error(error);
            }
        }
    });
});
}

@GrpcMethod('PersonService', 'SeedDatabase')
async seedDatabase(data: { count: number }): Promise<any> {
try {
    const result = await this.seedService.seedDatabase(data.count);
    return {
        success: true,
        count: result.count,
        message: `Successfully seeded ${result.count} records`
    };
} catch (error) {
    return {
        success: false,
        count: 0,
        message: `Failed to seed database: ${error.message}`
    };
}
}
}