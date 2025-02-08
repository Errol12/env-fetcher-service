import { 
    IsString, 
    IsOptional, 
    IsArray, 
    ValidateIf, 
    ValidateNested, 
    IsBoolean, 
    MaxLength 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class AwsCredentialsDto {
    @IsString()
    accessKeyId: string;
  
    @IsString()
    secretAccessKey: string;
  }
  
  class CredentialsDto {
    @IsString()
    region: string;
  
    @ValidateNested()
    @Type(() => AwsCredentialsDto)
    credentials: AwsCredentialsDto;
  }
  
  class MetadataDto {
    @IsOptional()
    @IsString()
    path?: string;
  
    @ValidateIf((o) => !o.path) // Only validate if path is NOT present
    @IsArray()
    @IsOptional()
    @MaxLength(3, { each: true }) // Max 3 elements
    paths?: string[];
  
    @ValidateIf((o) => !o.path) // Only validate if path is NOT present
    @IsArray()
    @IsOptional()
    @MaxLength(10, { each: true }) // Max 10 elements
    keys?: string[];
  
    @ValidateIf((o) => o.path) // If path is present, paths & keys must be empty
    validateNoPathsOrKeys() {
      if (this.path && ((this.paths && this.paths.length > 0) || (this.keys && this.keys.length > 0))) {
        throw new Error('If path is provided, paths and keys must be empty');
      }
    }
  }
  
  class EnrichmentOptionsDto {
    @IsBoolean()
    enrichResponse: boolean;
  
    @IsBoolean()
    trimPathVariableName: boolean;
  }
  
  export class SchemaDto {
    @ValidateNested()
    @Type(() => CredentialsDto)
    credentials: CredentialsDto;
  
    @ValidateNested()
    @Type(() => MetadataDto)
    metadata: MetadataDto;
  
    @ValidateNested()
    @Type(() => EnrichmentOptionsDto)
    enrichmentOptions: EnrichmentOptionsDto;
  }
  