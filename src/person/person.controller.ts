import { Controller, Post, Body } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { PersonService } from './person.service';
import { PersonRequest, EmptyRequest, SyncResponse, PersonResponse } from './person.interface';

@Controller('api/person')
export class PersonController {
constructor(private readonly personService: PersonService) {
    console.log('PersonController constructor called');
}

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

@GrpcMethod('PersonService', 'GetAllPeople')
async getAllPeople(data: EmptyRequest) {
  console.log('GetAllPeople called in controller');
  
  try {
    // Criar um Observable para streaming
    const subject = new Subject<PersonResponse>();
    
    // Processar os resultados de forma assíncrona
    (async () => {
      try {
        console.log('Calling service getAllPeople');
        const iterator = this.personService.getAllPeople();
        
        for await (const person of iterator) {
          console.log('Sending person:', person.id);
          subject.next(person);
        }
        
        subject.complete();
        console.log('Finished sending all people');
      } catch (err) {
        console.error('Error processing stream:', err);
        subject.error(err);
      }
    })();

    return subject.asObservable();
  } catch (error) {
    console.error('Error in controller:', error);
    throw error;
  }
}

@GrpcMethod('PersonService', 'UpdatePerson')
async updatePerson(data: PersonRequest): Promise<PersonResponse> {
  console.log('Controller: UpdatePerson called with data:', data);
  try {
    const result = await this.personService.updatePerson(data);
    console.log('Controller: Person updated successfully');
    return result;
  } catch (error) {
    console.error('Controller: Error updating person:', error);
    throw error;
  }
}

@Post('generate-random')
async generateRandomPeople(@Body() data: { count?: number }) {
  console.log('Endpoint hit: POST /api/person/generate-random');
  console.log('Request data:', data);
  const result = await this.personService.generateRandomPeople(data.count || 100);
  console.log('Result:', result);
  return result;
}
}