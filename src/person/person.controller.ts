import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { PersonService } from './person.service';
import { PersonRequest, EmptyRequest, SyncResponse, PersonResponse, RestPersonResponse, RestUpdatePersonRequest } from './person.interface';

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
const startTime = Date.now();

try {
  const subject = new Subject<PersonResponse>();
  
  // Processar os resultados de forma assíncrona com melhor controle de memória
  (async () => {
    try {
      console.log('Starting stream processing');
      let count = 0;
      
      for await (const person of this.personService.getAllPeople()) {
        subject.next(person);
        count++;
        
        if (count % 1000 === 0) {
          console.log(`Streamed ${count} records`);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`Completed streaming ${count} records in ${duration}ms`);
      subject.complete();
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
  const startTime = Date.now();
  console.log('gRPC Controller: Starting update with data:', JSON.stringify(data));
  
  try {
    const result = await this.personService.updatePerson(data);
    
    const duration = Date.now() - startTime;
    console.log(`gRPC Controller: Update completed in ${duration}ms`);
    
    return result;
  } catch (error) {
    console.error('gRPC Controller: Error:', error);
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

// Métodos REST com nomes diferentes
@Get('rest/all')
async getAllPeopleRest(): Promise<RestPersonResponse[]> {
  console.log('REST: Getting all people');
  const startTime = Date.now();
  
  try {
    const people = await this.personService.findAllRest();
    const duration = Date.now() - startTime;
    console.log(`REST: Retrieved ${people.length} records in ${duration}ms`);

    // Converter as datas para string no formato ISO
    const response: RestPersonResponse[] = people.map(person => ({
      id: person.id,
      name: person.name,
      lastName: person.lastName,
      localId: person.localId,
      age: person.age,
      weight: person.weight,
      createdAt: person.createdAt.toISOString(), // Converter para string
      syncedAt: person.syncedAt.toISOString() // Converter para string se existir
    }));

    return response;
  } catch (error) {
    console.error('REST: Error getting all people:', error);
    throw error;
  }
}

@Put('rest/update/:id')
async updatePersonRest(
@Param('id') id: number,
@Body() updatePersonDto: RestUpdatePersonRequest
): Promise<RestPersonResponse> {
console.log(`REST Controller: Starting update for person ${id}`);
console.log('REST Controller: Received DTO:', JSON.stringify(updatePersonDto));

try {
    // Criar explicitamente o objeto de atualização
    const updateData = {
        name: updatePersonDto.name,
        lastName: updatePersonDto.lastName,
        age: updatePersonDto.age,
        weight: updatePersonDto.weight
    };

    console.log('REST Controller: Data being sent to service:', JSON.stringify(updateData));

    // Passar o objeto explicitamente para o service
    const updated = await this.personService.updateRest(id, updateData);

    return {
        id: updated.id,
        name: updated.name,
        lastName: updated.lastName,
        age: updated.age,
        localId: updated.localId,
        weight: updated.weight,
        createdAt: updated.createdAt.toISOString(),
        syncedAt: updated.syncedAt.toISOString()
    };
} catch (error) {
    console.error(`REST Controller: Error updating person ${id}:`, error);
    throw error;
}
}
}